import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getServerAuthSession } from '../server/common/get-server-auth-session';
import { Ingredient } from '@prisma/client';
import { trpc } from '../utils/trpc';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { Combobox } from '@headlessui/react';
import convertUnits from '../utils/convert-units';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import MyDialog from '../components/NewIngredientModal';

type Inputs = {
  name: string;
  desc: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  steps: { value: string }[];
  ingredients: { ingredientId: string; quantity: number; unit: string }[];
  tags: { name: string }[];
};

const EditPage = () => {
  const router = useRouter();
  const id = router.query.id;

  const [ingredientComboboxInputValue, setIngredientComboboxInputValue] = useState('');
  const [newIngredientModalOpen, setNewIngredientModalOpen] = useState(false);

  const { data: ingredientsData, isLoading: ingredientsLoading } = trpc.useQuery(['ingredient.get-all']);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<Inputs>({ defaultValues: { steps: [{ value: '' }] } });
  const { fields: stepsFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: 'steps', rules: { minLength: 1 } });
  const { fields: ingredientsFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({ control, name: 'ingredients', rules: { minLength: 1 } });

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data);

  if (ingredientsLoading || !ingredientsData) {
    return <div>Loading...</div>;
  }

  const filteredIngredients = ingredientsData.filter((ingredient) => ingredient.name.toLowerCase().includes(ingredientComboboxInputValue.toLowerCase()));

  const onAddIngredient = (id: string) => {
    appendIngredient({ ingredientId: id, quantity: NaN, unit: '' });
    setIngredientComboboxInputValue('');
  };

  const onCloseModal = () => {
    setIngredientComboboxInputValue('');
  };

  return (
    <main className='flex min-h-screen flex-col bg-zinc-400 text-zinc-800'>
      <Navbar />
      <div className='mx-auto flex w-full max-w-5xl grow flex-col items-center bg-zinc-200 p-8 shadow-2xl'>
        EditPage {JSON.stringify(id)}
        <form onSubmit={handleSubmit(onSubmit)} className='flex w-full flex-col gap-2'>
          {/* NAME: */}
          <label className='flex flex-col'>
            <span>Name:</span>
            <input {...register('name', { required: true })} />
            {errors.name && <span>This is empty...</span>}
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
              <input type='number' {...register('servings', { required: true, valueAsNumber: true })} />
              {errors.servings && <span>This is empty...</span>}
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
                      className='w-full'
                      {...register(`steps.${index}.value` as const, {
                        required: true,
                      })}
                    />
                    {errors.steps && errors.steps[index] && <span>This is empty...</span>}
                  </label>
                </li>
              );
            })}
          </ol>

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
                  <span>{ingredientsData.find((ingr) => ingr.id === ingredientField.ingredientId)?.name || '-'}</span>
                  <label>
                    <input
                      type='number'
                      className='w-full'
                      {...register(`ingredients.${index}.quantity` as const, {
                        required: true,
                      })}
                    />
                    {errors.ingredients && errors.ingredients[index] && <span>This is empty...</span>}
                  </label>
                  <label>
                    <select
                      {...register(`ingredients.${index}.unit` as const, {
                        required: false,
                      })}
                    >
                      {convertUnits()
                        .list(ingredientsData.find((ingr) => ingr.id === ingredientField.ingredientId)?.unitType)
                        .filter((unit) => unit.system === 'metric')
                        .map((unit) => (
                          <option key={unit.abbr} value={unit.abbr}>
                            {unit.plural}
                          </option>
                        ))}
                    </select>
                    {errors.ingredients && errors.ingredients[index] && <span>This is empty...</span>}
                  </label>
                  <Button onClick={() => removeIngredient(index)}>-</Button>
                </div>
              );
            })}
          </div>
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
              </Combobox.Options>
            </div>
          </Combobox>

          {/* TAGS: */}
          {/* <input {...register('tags')} /> */}

          <button type='submit'>Save</button>
        </form>
      </div>

      {newIngredientModalOpen && (
        <MyDialog
          initialtext={ingredientComboboxInputValue}
          isOpen={newIngredientModalOpen}
          setIsOpen={setNewIngredientModalOpen}
          onSuccess={onAddIngredient}
          onCancel={onCloseModal}
        />
      )}
    </main>
  );
};

export default EditPage;

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
