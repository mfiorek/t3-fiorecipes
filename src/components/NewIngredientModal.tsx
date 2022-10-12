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
};

interface ModalProps {
  initialtext: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

const MyDialog: React.FC<ModalProps> = ({ initialtext, isOpen, setIsOpen, onSuccess, onCancel }) => {
  const { data: session } = useSession();
  const client = trpc.useContext();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NewIngredientInputs>({ defaultValues: { id: cuid(), name: initialtext, unitType: undefined } });

  const addIngredient = trpc.useMutation(['ingredient.add-ingredient'], {
    onMutate: async ({ id, name, unitType }) => {
      // Clear form:
      reset();
      // Cancel any outgoing refetches
      client.cancelQuery(['ingredient.get-all']);
      // Snapshot previous value:
      const previousIngredients = client.getQueryData(['ingredient.get-all']);
      // Optimistically update to the new value:
      if (previousIngredients && session?.user) {
        client.setQueryData(['ingredient.get-all'], [...previousIngredients, { id, name, unitType, userId: session.user.id }]);
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
    addIngredient.mutate(data);
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
                <input {...register('name', { required: true })} />
                {errors.name && <span>This is empty...</span>}
              </label>

              <label className='flex flex-col'>
                <span>Unit type:</span>
                <select
                  {...register(`unitType` as const, {
                    required: false,
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
              </label>

              <button
                type='submit'
                className='inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
              >
                Add!!
              </button>
            </form>

            <div className='mt-4'>
              <button
                type='button'
                className='inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default MyDialog;
