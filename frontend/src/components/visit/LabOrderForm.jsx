import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import { labTestService } from '../../utils/labTestService';
import { visitService } from '../../utils/visitService';

const LabOrderForm = ({ visitId, existingOrders }) => {
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const queryClient = useQueryClient();

  const { data: labTestsData, isLoading: isLoadingTests } = useQuery('labTests', labTestService.getAll);
  const testOptions = labTestsData?.data?.map(t => ({ value: t.name, label: t.name })) || [];

  const mutation = useMutation(visitService.addLabOrder, {
    onSuccess: () => {
      toast.success('Lab order added!');
      queryClient.invalidateQueries(['visit', visitId]);
      reset();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to add order.'),
  });

  const onSubmit = (data) => {
    const orderData = { testName: data.test.value, notes: data.notes };
    mutation.mutate({ visitId, orderData });
  };

  return (
    <div>
      <h4 className="font-semibold mb-2">New Lab Order</h4>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
        <div>
          <label className="label-field">Test Name</label>
          <Controller name="test" control={control} render={({ field }) => (
            <Select {...field} options={testOptions} isLoading={isLoadingTests} isClearable />
          )} />
        </div>
        <div>
          <label className="label-field">Notes (Optional)</label>
          <input {...control.register('notes')} className="input-field" />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>Add Order</button>
        </div>
      </form>
      <h4 className="font-semibold mb-2">Existing Orders</h4>
      <ul className="space-y-2">
        {existingOrders?.map(order => (
          <li key={order._id} className="p-2 border rounded-md bg-gray-50">{order.testName} - <span className="capitalize text-gray-600">{order.status}</span></li>
        ))}
        {existingOrders?.length === 0 && <p className="text-gray-500">No lab orders yet.</p>}
      </ul>
    </div>
  );
};

export default LabOrderForm;