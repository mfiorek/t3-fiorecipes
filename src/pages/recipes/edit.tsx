import React, { useState } from 'react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { PresignedPost } from 'aws-sdk/clients/s3';
import { Ingredient, Tag } from '@prisma/client';
import { inferQueryOutput, trpc } from '../../utils/trpc';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { useFileUpload } from '../../hooks/useFileUpload';
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { Combobox } from '@headlessui/react';
import cuid from 'cuid';
import convertUnits, { forbiddenUnits } from '../../utils/convert-units';
import Link from 'next/link';
import Image from 'next/image';
import Content from '../../components/Content';
import Loader from '../../components/Loader';
import NewIngredientModal from '../../components/NewIngredientModal';
import Button from '../../components/Button';

interface EditRecipeContentsProps {
  recipe: inferQueryOutput<'recipe.get-all'>[number];
  ingredients: inferQueryOutput<'ingredient.get-all'>;
  tags: inferQueryOutput<'tag.get-all'>;
  presignedUrls: inferQueryOutput<'s3.getMultiplePresignedUrls'>;
}
const EditRecipeContents: React.FC<EditRecipeContentsProps> = ({ recipe, ingredients, tags, presignedUrls }) => {
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

  const router = useRouter();
  const [disabledOnSave, setDisabledOnSave] = useState(false);
  const [disabledOnDelete, setDisabledOnDelete] = useState(false);
  const [ingredientComboboxInputValue, setIngredientComboboxInputValue] = useState('');
  const [newIngredientModalOpen, setNewIngredientModalOpen] = useState(false);
  const [tagComboboxInputValue, setTagComboboxInputValue] = useState('');

  const presignedUrl = presignedUrls?.get(recipe.id);

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
    onSuccess: () => {
      client.invalidateQueries(['recipe.get-all']);
      router.push({
        pathname: '/recipes/view',
        query: { id: recipe.id },
      });
    },
  });
  const deleteRecipeMutation = trpc.useMutation(['recipe.delete'], {
    onSuccess: () => {
      client.invalidateQueries(['recipe.get-all']);
      router.push('/recipes');
    },
  });

  const createPresignedUrlMutation = trpc.useMutation(['s3.createPresignedUrl']);
  const { file, fileRef, handleFileChange, uploadFile } = useFileUpload({
    getUploadUrl: (id) => createPresignedUrlMutation.mutateAsync({ recipeId: id }) as Promise<PresignedPost>,
    onFileUploaded: () => client.refetchQueries(['s3.getMultiplePresignedUrls']),
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
    setDisabledOnSave(true);
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
    if (file) {
      uploadFile(recipe.id);
    }
  };
  const onDelete = () => {
    setDisabledOnDelete(true);
    deleteRecipeMutation.mutate({ id: recipe.id });
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
    <Content>
      <div className='flex w-full items-start justify-between'>
        <div>
          <h1 className='text-4xl font-semibold'>Edit recipe:</h1>
          <h1 className='text-4xl font-semibold'>{recipe.name}</h1>
        </div>
        <div className='flex gap-2'>
          <button className='flex items-center gap-2 rounded bg-red-400 bg-opacity-50 p-2 hover:bg-opacity-100' onClick={onDelete} disabled={disabledOnSave || disabledOnDelete}>
            <span>Delete</span>
            {disabledOnDelete ? (
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 animate-spin' viewBox='0 0 24 24' stroke='currentColor' fill='currentColor'>
                <path d='M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z' />
              </svg>
            ) : (
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='h-6 w-6'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
                />
              </svg>
            )}
          </button>
          <Link
            href={{
              pathname: '/recipes/view',
              query: { id: recipe.id },
            }}
          >
            <button className='rounded bg-zinc-400 bg-opacity-50 p-2 hover:bg-opacity-100'>
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='h-6 w-6'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3' />
              </svg>
            </button>
          </Link>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className='flex w-full flex-col gap-2'>
        <fieldset disabled={disabledOnSave || disabledOnDelete}>
          {/* PICTURE: */}
          <div className='flex flex-col'>
            {presignedUrl && (
              <div>
                <Image src={presignedUrl} alt='recipe image' width={'400'} height={'400'} className='aspect-square object-cover' />
              </div>
            )}
            <label htmlFor='file-upload'>
              <span>Upload picture</span>
              <input ref={fileRef} id='file-upload' className='' onChange={handleFileChange} type='file'></input>
            </label>
          </div>

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
                      {ingredients.find((ingr) => ingr.id === ingredientField.ingredientId)?.unitType === 'custom'
                        ? ingredients
                            .find((ingr) => ingr.id === ingredientField.ingredientId)
                            ?.customUnitNames?.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))
                        : convertUnits()
                            .list(ingredients.find((ingr) => ingr.id === ingredientField.ingredientId)?.unitType)
                            .filter((unit) => !forbiddenUnits.includes(unit.abbr))
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
                    {filteredIngredients
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((ingredient) => (
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
                  filteredTags
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((tag) => (
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
            {disabledOnSave && (
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
    </Content>
  );
};

const EditRecipePage = () => {
  const { data: recipeData, isLoading: recipeLoading, isStale: isRecipesStale } = trpc.useQuery(['recipe.get-all'], { staleTime: Infinity });
  const { data: ingredientsData, isLoading: ingredientsLoading } = trpc.useQuery(['ingredient.get-all']);
  const { data: tagsData, isLoading: tagsLoading } = trpc.useQuery(['tag.get-all']);

  const recipeIdsArray = recipeData?.map((recipe) => recipe.id) || null;
  const { data: presignedUrlsData, isLoading: presignedUrlLoading } = trpc.useQuery(['s3.getMultiplePresignedUrls', { arrayOfRecipeIds: recipeIdsArray }], {
    staleTime: 900 * 1000,
    cacheTime: 900 * 1000,
  });

  const router = useRouter();
  const { id: selectedRecipeId } = router.query;
  const recipe = recipeData?.find((rec) => rec.id === selectedRecipeId);

  if (recipeLoading || ingredientsLoading || tagsLoading || presignedUrlLoading || !recipeData || !ingredientsData || !tagsData || !presignedUrlsData || isRecipesStale) {
    return (
      <Content>
        <Loader text='Loading recipes...' />
      </Content>
    );
  }
  if (!recipe) {
    return (
      <Content>
        <h1>Oops... something went wrong 😥</h1>
      </Content>
    );
  }
  return <EditRecipeContents recipe={recipe} ingredients={ingredientsData} tags={tagsData} presignedUrls={presignedUrlsData} />;
};

export default EditRecipePage;

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(context);
  if (!session?.user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
