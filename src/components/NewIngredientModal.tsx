import React from 'react';
import cuid from 'cuid';
import convertUnits from '../utils/convert-units';
import { useSession } from 'next-auth/react';
import { UnitType } from '@prisma/client';
import { trpc } from '../utils/trpc';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Dialog } from '@headlessui/react';

type NewIngredientInputs = {
  id: string;
  name: string;
  unitType: UnitType;
  customUnitNames: string;
};

interface NewIngredinetModalProps {
  initialtext: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

const NewIngredientModal: React.FC<NewIngredinetModalProps> = ({ initialtext, isOpen, setIsOpen, onSuccess, onCancel }) => {
  const { data: session } = useSession();
  const client = trpc.useContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<NewIngredientInputs>({ defaultValues: { id: cuid(), name: initialtext, unitType: undefined, customUnitNames: undefined } });

  const addIngredient = trpc.useMutation(['ingredient.add-ingredient'], {
    onMutate: async ({ id, name, unitType, customUnitNames }) => {
      // Clear form:
      reset();
      // Cancel any outgoing refetches
      client.cancelQuery(['ingredient.get-all']);
      // Snapshot previous value:
      const previousIngredients = client.getQueryData(['ingredient.get-all']);
      // Optimistically update to the new value:
      if (previousIngredients && session?.user) {
        client.setQueryData(['ingredient.get-all'], [...previousIngredients, { id, name, unitType, customUnitNames, userId: session.user.id }]);
      }
      return { previousIngredients };
    },
    onError: (err, variables, context) => {
      if (context?.previousIngredients) {
        client.setQueryData(['ingredient.get-all'], context.previousIngredients);
      }
    },
  });

  const handleSuccess: SubmitHandler<NewIngredientInputs> = (data) => {
    onSuccess(data.id);
    addIngredient.mutate({ id: data.id, name: data.name, unitType: data.unitType, customUnitNames: data.customUnitNames?.split(', ') || [] });
    setIsOpen(false);
  };

  const handleClose = () => {
    onCancel();
    reset();
    setIsOpen(false);
  };

  return (
    <Dialog as='div' className='relative z-10' open={isOpen} onClose={handleClose}>
      <div className='fixed inset-0 bg-black bg-opacity-25' />

      <div className='fixed inset-0 overflow-y-auto'>
        <div className='flex min-h-full items-center justify-center p-4 text-center'>
          <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
            <Dialog.Title as='h3' className='text-lg font-medium leading-6 text-gray-900'>
              Add new ingredient
            </Dialog.Title>

            <form onSubmit={handleSubmit(handleSuccess)} className='mt-2'>
              <input
                type='text'
                className='hidden'
                {...register(`id` as const, {
                  required: true,
                })}
              />

              <label className='flex flex-col'>
                <span>Name:</span>
                <input {...register('name', { required: { value: true, message: "Name can't be empty..." } })} />
                {errors.name && <span className='text-red-500'>{errors.name.message}</span>}
              </label>

              <label className='flex flex-col'>
                <span>Unit type:</span>
                <i className='text-xs'>Unit types group units that can be converted between each other.</i>
                <select
                  {...register(`unitType` as const, {
                    required: { value: true, message: "Unit type can't be empty..." },
                  })}
                >
                  {convertUnits()
                    .measures()
                    .map((measure) => (
                      <option key={measure} value={measure}>
                        {measure}
                      </option>
                    ))}
                </select>
                {errors.unitType && <span className='text-red-500'>{errors.unitType.message}</span>}
              </label>

              {watch('unitType') === 'custom' && (
                <>
                  <div className='mt-4 flex gap-2 rounded-md border border-red-400 bg-red-100 p-2'>
                    <span>
                      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='h-6 w-6'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z'
                        />
                      </svg>
                    </span>
                    <span>Custom unit types will not be automatically converted between each other and you need to specify custom unit names below.</span>
                  </div>

                  <label className='flex flex-col'>
                    <span>Custom unit names:</span>
                    <i className='text-xs'>If you want more than one unit, list their names separated by commas</i>
                    <input {...register('customUnitNames', { required: { value: watch('unitType') === 'custom', message: "Custom unit names can't be empty..." } })} />
                    {errors.customUnitNames && <span className='text-red-500'>{errors.customUnitNames.message}</span>}
                  </label>
                </>
              )}

              <div className='mt-4 flex justify-end gap-2'>
                <button
                  type='submit'
                  className='rounded-md border border-transparent bg-lime-100 px-4 py-2 text-sm font-medium text-lime-900 hover:bg-lime-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                >
                  Add
                </button>
                <button
                  type='button'
                  className='rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                  onClick={handleClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default NewIngredientModal;
