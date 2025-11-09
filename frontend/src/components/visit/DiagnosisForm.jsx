import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { visitService } from '../../utils/visitService';

const DiagnosisForm = ({ visitId, existingDiagnosis }) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: existingDiagnosis || {},
  });
  const queryClient = useQueryClient();

  const mutation = useMutation(visitService.updateDiagnosis, {
    onSuccess: () => {
      toast.success('Diagnosis saved!');
      queryClient.invalidateQueries(['visit', visitId]);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to save diagnosis.'),
  });

  const onSubmit = (data) => {
    mutation.mutate({ visitId, diagnosisData: data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label-field">Condition</label>
        <input {...register('condition', { required: true })} className="input-field" />
      </div>
      <div>
        <label className="label-field">ICD-10 Code</label>
        <input {...register('icd10Code')} className="input-field" />
      </div>
      <div>
        <label className="label-field">Notes</label>
        <textarea {...register('notes')} className="input-field" rows="4"></textarea>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Diagnosis'}
        </button>
      </div>
    </form>
  );
};

export default DiagnosisForm;