import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Select from 'react-select';
import { toast } from 'react-hot-toast';
import { medicationService } from '../../utils/medicationService';
import { visitService } from '../../utils/visitService';

const PrescriptionForm = ({ visitId, existingPrescriptions }) => {
  const { control, handleSubmit, register, reset, formState: { isSubmitting } } = useForm();
  const queryClient = useQueryClient();

  const { data: medicationsData, isLoading: isLoadingMeds } = useQuery('medications', medicationService.getAll);
  const medOptions = medicationsData?.data?.map(m => ({ value: m.name, label: `${m.name} (${m.strength})` })) || [];

  const mutation = useMutation(visitService.addPrescription, {
    onSuccess: () => {
      toast.success('Prescription added!');
      queryClient.invalidateQueries(['visit', visitId]);
      reset();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to add prescription.'),
  });

  const onSubmit = (data) => {
    const prescriptionData = { ...data, medication: data.medication.value };
    mutation.mutate({ visitId, prescriptionData });
  };

  return (
    <div>
      <h4 className="font-semibold mb-2">New Prescription</h4>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Medication</label>
            <Controller name="medication" control={control} render={({ field }) => (
              <Select {...field} options={medOptions} isLoading={isLoadingMeds} isClearable />
            )} />
          </div>
          <div>
            <label className="label-field">Dosage (e.g., 1 tablet)</label>
            <input {...register('dosage')} className="input-field" />
          </div>
          <div>
            <label className="label-field">Frequency (e.g., Twice a day)</label>
            <input {...register('frequency')} className="input-field" />
          </div>
           <div>
            <label className="label-field">Duration (e.g., 7 days)</label>
            <input {...register('duration')} className="input-field" />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>Add Prescription</button>
        </div>
      </form>
      <h4 className="font-semibold mb-2">Existing Prescriptions</h4>
      <ul className="space-y-2">
        {existingPrescriptions?.map(p => (
          <li key={p._id} className="p-2 border rounded-md bg-gray-50">{p.medication} - {p.dosage}, {p.frequency}</li>
        ))}
        {existingPrescriptions?.length === 0 && <p className="text-gray-500">No prescriptions yet.</p>}
      </ul>
    </div>
  );
};

export default PrescriptionForm;