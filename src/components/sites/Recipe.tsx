import React, { useState } from 'react';
import { Ingredient, Tag } from '@prisma/client';
import { inferQueryOutput, trpc } from '../../utils/trpc';
import { useSetAtom } from 'jotai';
import { selectedRecipeAtom } from '../../state/atoms';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { Combobox } from '@headlessui/react';
import cuid from 'cuid';
import Button from '../Button';
import NewIngredientModal from '../NewIngredientModal';
import convertUnits from '../../utils/convert-units';

interface ViewRecipeProps {
  recipe: inferQueryOutput<'recipe.get-all'>[number];
  setIsInEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}
const ViewRecipe: React.FC<ViewRecipeProps> = ({ recipe, setIsInEditMode }) => {
  const setSelectedRecipe = useSetAtom(selectedRecipeAtom);
  const [servings, setServings] = useState(recipe.servings);

  const incrementServings = () => {
    setServings(servings + 1);
  };
  const decrementServings = () => {
    if (servings > 1) {
      setServings(servings - 1);
    }
  };

  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='flex items-start justify-between'>
        <h1 className='text-4xl font-semibold'>{recipe.name}</h1>
        <div className='flex gap-2'>
          <button className='rounded bg-zinc-400 bg-opacity-50 p-2 hover:bg-opacity-100' onClick={() => setIsInEditMode(true)}>
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='h-6 w-6'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
              />
            </svg>
          </button>
          <button className='rounded bg-zinc-400 bg-opacity-50 p-2 hover:bg-opacity-100' onClick={() => setSelectedRecipe(null)}>
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='h-6 w-6'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3' />
            </svg>
          </button>
        </div>
      </div>
      <div className='flex gap-2'>
        {recipe.tags.map((tag) => (
          <span key={tag.id} className='rounded-full bg-lime-600 px-3'>
            {tag.name}
          </span>
        ))}
      </div>
      <div>
        <i>{recipe.desc}</i>
      </div>
      <div className='flex gap-4 text-center'>
        <div className='flex flex-col items-center justify-center rounded-xl bg-zinc-400 px-4 py-2'>
          <h3 className='font-semibold'>Prep time:</h3>
          <p>{Number(recipe.prepTime)} min</p>
        </div>
        <div className='flex flex-col items-center justify-center rounded-xl bg-zinc-400 px-4 py-2'>
          <h3 className='font-semibold'>Cook time:</h3>
          <p>{Number(recipe.cookTime)} min</p>
        </div>
        <div className='flex flex-col items-center justify-center rounded-xl bg-zinc-400 px-4 py-2'>
          <h3 className='font-semibold'>Total time:</h3>
          <p>{Number(recipe.cookTime) + Number(recipe.prepTime)} min</p>
        </div>
      </div>
      <div className='grid grid-cols-1 gap-y-8 gap-x-4 md:grid-cols-[1fr_2fr] '>
        <div>
          <h3 className='text-lg font-semibold'>Ingredients</h3>
          <div>
            <h4 className='font-semibold'>
              for{' '}
              <span className='rounded bg-zinc-300 py-2'>
                <Button onClick={decrementServings}>-</Button>
                {servings}
                <Button onClick={incrementServings}>+</Button>
              </span>{' '}
              servings:
            </h4>
          </div>
          <div>
            {recipe.ingredientOnRecipe.map((ior) => (
              <div key={ior.ingredient.id} className='flex gap-2'>
                <p>{ior.ingredient.name}</p>
                <p>{(ior.quantity * servings) / recipe.servings || '-'}</p>
                <p>{ior.unit}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className='text-lg font-semibold'>Steps:</h3>
          <ol className='list-decimal pl-4'>
            {recipe.steps.map((step, index) => (
              <li key={`${step}+${index}`}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

interface EditRecipeProps {
  recipe: inferQueryOutput<'recipe.get-all'>[number];
  ingredients: inferQueryOutput<'ingredient.get-all'>;
  tags: inferQueryOutput<'tag.get-all'>;
  setIsInEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}
const EditRecipe: React.FC<EditRecipeProps> = ({ recipe, ingredients, tags, setIsInEditMode }) => {
  type Inputs = {
    id: string;
    name: string;
    desc: string;
    prepTime?: number;
    cookTime?: number;
    servings: number;
    steps: { value: string }[];
    ingredients: { ingredientId: string; quantity: number | undefined; unit: string }[];
    tags: { tagId: string; name: string; userId: string }[];
  };

  const setSelectedRecipe = useSetAtom(selectedRecipeAtom);
  const [disabled, setDisabled] = useState(false);
  const [ingredientComboboxInputValue, setIngredientComboboxInputValue] = useState('');
  const [newIngredientModalOpen, setNewIngredientModalOpen] = useState(false);
  const [tagComboboxInputValue, setTagComboboxInputValue] = useState('');

  const client = trpc.useContext();
  const addTagMutation = trpc.useMutation(['tag.add-tag'], {
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches
      client.cancelQuery(['tag.get-all']);
      // Snapshot previous value:
      const previousTags = client.getQueryData(['tag.get-all']);
      // Optimistically update to the new value:
      if (previousTags) {
        client.setQueryData(['tag.get-all'], [...previousTags, { id, name, userId: recipe.userId }]);
      }
      return { previousTags };
    },
    onError: (err, variables, context) => {
      if (context?.previousTags) {
        client.setQueryData(['tag.get-all'], context.previousTags);
      }
    },
  });
  const updateRecipeMutation = trpc.useMutation(['recipe.update'], {
    onSuccess: (data) => {
      client.invalidateQueries(['recipe.get-all']);
      setSelectedRecipe(data);
      setIsInEditMode(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    getValues,
  } = useForm<Inputs>({
    defaultValues: {
      id: recipe.id,
      name: recipe.name,
      desc: recipe.desc || undefined,
      prepTime: recipe.prepTime || undefined,
      cookTime: recipe.cookTime || undefined,
      servings: recipe.servings,
      steps: recipe.steps.map((step) => ({
        value: step,
      })),
      ingredients: recipe.ingredientOnRecipe.map((ior) => ({
        ingredientId: ior.ingredient.id,
        quantity: ior.quantity,
        unit: ior.unit,
      })),
      tags: recipe.tags.map((tag) => ({
        tagId: tag.id,
        name: tag.name,
        userId: recipe.userId,
      })),
    },
  });
  const {
    fields: stepsFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({ control, name: 'steps', rules: { required: { value: true, message: 'Add at least one step' } } });
  const {
    fields: ingredientsFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: 'ingredients', rules: { required: { value: true, message: 'Add at least one ingredient' } } });
  const { fields: tagsFields, append: appendTag, remove: removeTag } = useFieldArray({ control, name: 'tags' });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    setDisabled(true);
    updateRecipeMutation.mutate({
      id: recipe.id,
      name: data.name,
      desc: data.desc,
      prepTime: data.prepTime || null,
      cooktime: data.cookTime || null,
      servings: data.servings,
      steps: data.steps.map((step) => step.value),
      ingredients: data.ingredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        quantity: ingredient.quantity || 0,
        unit: ingredient.unit,
      })),
      tags: data.tags.map((tag) => tag.tagId),
    });
  };

  const filteredIngredients = ingredients
    .filter(
      (ingredient) =>
        !getValues('ingredients')
          ?.map((ingredient) => ingredient.ingredientId)
          .includes(ingredient.id),
    )
    .filter((ingredient) => ingredient.name.toLowerCase().includes(ingredientComboboxInputValue.toLowerCase()));
  const filteredTags = tags
    .filter(
      (tag) =>
        !getValues('tags')
          ?.map((tag) => tag.tagId)
          .includes(tag.id),
    )
    .filter((tag) => tag.name.toLowerCase().includes(tagComboboxInputValue.toLowerCase()));

  const onAddIngredient = (id: string) => {
    appendIngredient({ ingredientId: id, quantity: undefined, unit: '' });
    setIngredientComboboxInputValue('');
  };

  const onCloseModal = () => {
    setIngredientComboboxInputValue('');
  };

  return (
    <>
      <div className='flex w-full items-start justify-between'>
        <div>
          <h1 className='text-4xl font-semibold'>Edit recipe:</h1>
          <h1 className='text-4xl font-semibold'>{recipe.name}</h1>
        </div>
        <button className='rounded bg-zinc-400 bg-opacity-50 p-2 hover:bg-opacity-100' onClick={() => setIsInEditMode(false)}>
          <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='h-6 w-6'>
            <path strokeLinecap='round' strokeLinejoin='round' d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3' />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='flex w-full flex-col gap-2'>
        <fieldset disabled={disabled}>
          {/* NAME: */}
          <label className='flex flex-col'>
            <span>Name:</span>
            <input {...register('name', { required: { value: true, message: "Name can't be empty..." } })} className={`${errors.name && 'border border-red-500'}`} />
            {errors.name && <span className='text-red-500'>{errors.name.message}</span>}
          </label>

          {/* DESC: */}
          <label className='flex flex-col'>
            <span>Description:</span>
            <textarea {...register('desc')} />
          </label>

          <div className='flex flex-wrap justify-between gap-2'>
            {/* PREP_TIME: */}
            <label className='flex flex-col'>
              <span>Prep time:</span>
              <input type='number' {...register('prepTime', { valueAsNumber: true })} />
            </label>

            {/* COOK_TIME: */}
            <label className='flex flex-col'>
              <span>Cook time:</span>
              <input type='number' {...register('cookTime', { valueAsNumber: true })} />
            </label>

            {/* SERVINGS: */}
            <label className='flex flex-col'>
              <span>Servings:</span>
              <input
                type='number'
                {...register('servings', { required: { value: true, message: "Servings can't be empty..." }, valueAsNumber: true })}
                className={`${errors.servings && 'border border-red-500'}`}
              />
              {errors.servings && <span className='text-red-500'>{errors.servings.message}</span>}
            </label>
          </div>

          {/* STEPS: */}
          <div className='flex items-center justify-between'>
            <span>Steps:</span>
            <div>
              <Button onClick={() => appendStep({ value: '' })}>+</Button>
              <Button onClick={() => removeStep(stepsFields.length - 1)}>-</Button>
            </div>
          </div>
          <ol className='flex w-full flex-col gap-1'>
            {stepsFields.map((stepField, index) => {
              return (
                <li key={stepField.id} className='ml-8 list-decimal'>
                  <label>
                    <input
                      type='text'
                      {...register(`steps.${index}.value` as const, {
                        required: { value: true, message: "Step can't be empty..." },
                      })}
                      className={`w-full ${errors.steps && errors.steps[index] && 'border border-red-500'}`}
                    />
                    {errors.steps && errors.steps[index]?.value && <span className='text-red-500'>{errors.steps[index]?.value?.message}</span>}
                  </label>
                </li>
              );
            })}
          </ol>
          {errors.steps?.root && <span className='text-red-500'>{errors.steps.root.message}</span>}

          {/* INGREDIENTS: */}
          <p>Ingredients:</p>
          <div className='flex w-full flex-col gap-2'>
            {ingredientsFields.map((ingredientField, index) => {
              return (
                <div key={ingredientField.id} className='flex w-full gap-4'>
                  <input
                    type='text'
                    className='hidden'
                    {...register(`ingredients.${index}.ingredientId` as const, {
                      required: true,
                    })}
                  />
                  <span>{ingredients.find((ingr) => ingr.id === ingredientField.ingredientId)?.name || '-'}</span>
                  <label>
                    <input
                      type='number'
                      {...register(`ingredients.${index}.quantity` as const, {
                        required: { value: true, message: "Quantity can't be empty..." },
                        valueAsNumber: true,
                      })}
                      className={`w-full ${errors.ingredients && errors.ingredients[index]?.quantity && 'border border-red-500'}`}
                    />
                    {errors.ingredients && errors.ingredients[index]?.quantity && <span className='text-red-500'>{errors.ingredients[index]?.quantity?.message}</span>}
                  </label>
                  <label>
                    <select
                      {...register(`ingredients.${index}.unit` as const, {
                        required: { value: true, message: "Unit can't be empty..." },
                      })}
                      className={`w-full ${errors.ingredients && errors.ingredients[index]?.unit && 'border border-red-500'}`}
                    >
                      {convertUnits()
                        .list(ingredients.find((ingr) => ingr.id === ingredientField.ingredientId)?.unitType)
                        .filter((unit) => unit.system === 'metric')
                        .map((unit) => (
                          <option key={unit.abbr} value={unit.abbr}>
                            {unit.plural}
                          </option>
                        ))}
                    </select>
                    {errors.ingredients && errors.ingredients[index]?.unit && <span className='text-red-500'>{errors.ingredients[index]?.unit?.message}</span>}
                  </label>
                  <Button onClick={() => removeIngredient(index)}>-</Button>
                </div>
              );
            })}
          </div>
          {errors.ingredients?.root && <span className='text-red-500'>{errors.ingredients.root.message}</span>}
          <Combobox
            value={{} as Ingredient}
            onChange={(ingr: Ingredient) => {
              if (ingr === null) {
                setNewIngredientModalOpen(true);
              } else {
                onAddIngredient(ingr.id);
              }
            }}
          >
            <div className='relative mt-1'>
              <div className='relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm'>
                <Combobox.Input
                  onChange={(event) => setIngredientComboboxInputValue(event.target.value)}
                  displayValue={(ingredient: Ingredient) => ingredient.name}
                  className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0'
                />
                <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>V</Combobox.Button>
              </div>
              <Combobox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                {getValues('ingredients')
                  ?.map((ingredient) => ingredients.find((ingr) => ingr.id === ingredient.ingredientId)?.name)
                  .find((ingredient) => ingredient?.toLowerCase() === ingredientComboboxInputValue.toLowerCase()) !== undefined ? (
                  <Combobox.Option
                    className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-red-400 text-white' : 'text-gray-900'}`}
                    value={null}
                    disabled={true}
                  >
                    <div>{ingredientComboboxInputValue} is already added</div>
                  </Combobox.Option>
                ) : (
                  <>
                    {filteredIngredients.map((ingredient) => (
                      <Combobox.Option
                        key={ingredient.id}
                        className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-600 text-white' : 'text-gray-900'}`}
                        value={ingredient}
                      >
                        {({ selected, active }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{ingredient.name}</span>
                            {selected ? <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'}`}>X</span> : null}
                          </>
                        )}
                      </Combobox.Option>
                    ))}
                    <Combobox.Option
                      className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-600 text-white' : 'text-gray-900'}`}
                      value={null}
                    >
                      <div>New...</div>
                    </Combobox.Option>
                  </>
                )}
              </Combobox.Options>
            </div>
          </Combobox>

          {/* TAGS: */}
          <p>Tags:</p>
          <div className='flex w-full gap-2'>
            {tagsFields.map((tagField, index) => {
              return (
                <div key={tagField.id} className='flex items-center justify-center gap-2 rounded bg-lime-500 px-2'>
                  <input
                    type='text'
                    className='hidden'
                    {...register(`tags.${index}.tagId` as const, {
                      required: true,
                    })}
                  />
                  <input
                    type='text'
                    className='hidden'
                    {...register(`tags.${index}.name` as const, {
                      required: true,
                    })}
                  />
                  <input
                    type='text'
                    className='hidden'
                    {...register(`tags.${index}.userId` as const, {
                      required: true,
                    })}
                  />
                  <span>#{getValues(`tags.${index}.name`)}</span>
                  <button onClick={() => removeTag(index)}>×</button>
                </div>
              );
            })}
          </div>
          <Combobox
            value={{} as Tag}
            onChange={(tag: Tag) => {
              if (tag === null) {
                const newId = cuid();
                addTagMutation.mutate({ id: newId, name: tagComboboxInputValue });
                appendTag({ tagId: newId, name: tagComboboxInputValue, userId: recipe.userId });
              } else {
                appendTag({ tagId: tag.id, name: tag.name, userId: tag.userId });
              }
              setTagComboboxInputValue('');
            }}
          >
            <div className='relative mt-1'>
              <div className='relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm'>
                <Combobox.Input
                  onChange={(event) => setTagComboboxInputValue(event.target.value)}
                  displayValue={(tag: Tag) => tag.name}
                  className='w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0'
                />
                <Combobox.Button className='absolute inset-y-0 right-0 flex items-center pr-2'>V</Combobox.Button>
              </div>
              <Combobox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
                {filteredTags.length === 0 && tagComboboxInputValue !== '' ? (
                  getValues('tags')?.find((tag) => tag.name.toLowerCase() === tagComboboxInputValue.toLowerCase()) !== undefined ? (
                    <Combobox.Option
                      className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-red-400 text-white' : 'text-gray-900'}`}
                      value={null}
                      disabled={true}
                    >
                      <div>#{tagComboboxInputValue} is already added</div>
                    </Combobox.Option>
                  ) : (
                    <Combobox.Option
                      className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-600 text-white' : 'text-gray-900'}`}
                      value={null}
                    >
                      <div>Add #{tagComboboxInputValue}</div>
                    </Combobox.Option>
                  )
                ) : (
                  filteredTags.map((tag) => (
                    <Combobox.Option
                      key={tag.id}
                      className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-600 text-white' : 'text-gray-900'}`}
                      value={tag}
                    >
                      {({ selected, active }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>#{tag.name}</span>
                          {selected ? <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'}`}>X</span> : null}
                        </>
                      )}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          </Combobox>

          <button type='submit' className='my-2 flex items-center gap-2 rounded bg-lime-500 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'>
            <span>Save</span>
            {disabled && (
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 animate-spin' viewBox='0 0 24 24' stroke='currentColor' fill='currentColor'>
                <path d='M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z' />
              </svg>
            )}
          </button>
        </fieldset>
      </form>

      {newIngredientModalOpen && (
        <NewIngredientModal
          initialtext={ingredientComboboxInputValue}
          isOpen={newIngredientModalOpen}
          setIsOpen={setNewIngredientModalOpen}
          onSuccess={onAddIngredient}
          onCancel={onCloseModal}
        />
      )}
    </>
  );
};

interface RecipeProps {
  recipe: inferQueryOutput<'recipe.get-all'>[number];
  ingredients: inferQueryOutput<'ingredient.get-all'>;
  tags: inferQueryOutput<'tag.get-all'>;
}
const Recipe: React.FC<RecipeProps> = ({ recipe, ingredients, tags }) => {
  const [isInEditMode, setIsInEditMode] = useState(false);
  return isInEditMode ? (
    <EditRecipe recipe={recipe} ingredients={ingredients} tags={tags} setIsInEditMode={setIsInEditMode} />
  ) : (
    <ViewRecipe recipe={recipe} setIsInEditMode={setIsInEditMode} />
  );
};

export default Recipe;
