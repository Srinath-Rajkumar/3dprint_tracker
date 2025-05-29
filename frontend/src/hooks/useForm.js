// frontend/src/hooks/useForm.js
import { useState, useCallback, useRef } from 'react';

const useForm = (initialState = {}, validate = () => ({})) => {
  // Store the initial state in a ref to maintain the same reference
  const initialStateRef = useRef(initialState);
  
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked, files } = event.target;
    // console.log('useForm handleChange:', { name, value, type }); // For debugging
    
    if (type === 'file') {
      setValues(prevValues => {
        const newVals = { ...prevValues, [name]: files[0] };
        // console.log('New values (file):', newVals);
        return newVals;
      });
    } else {
      setValues(prevValues => {
        const newVals = { 
          ...prevValues, 
          [name]: type === 'checkbox' ? checked : value 
        };
        // console.log('New values (text/select):', newVals);
        return newVals;
      });
    }
  }, []); // Dependencies: setValues is stable from useState.

  const handleSubmit = useCallback(async (event, callback) => {
    if (event) event.preventDefault();
    
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setIsSubmitting(true);
    
    if (Object.keys(validationErrors).length === 0) {
      if (callback) {
        try {
          await callback();
        } catch (e) {
          // console.error("Submission callback error", e);
          setIsSubmitting(false);
          throw e;
        }
      }
    }
    
    setIsSubmitting(false);
  }, [values, validate]);

  const resetForm = useCallback((newInitialState) => {
    // Use the provided newInitialState or fall back to the ref
    const stateToUse = newInitialState || initialStateRef.current;
    setValues(stateToUse);
    setErrors({});
    setIsSubmitting(false);
  }, []); // Remove initialState from dependencies

  const setFormValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  return {
    values,
    setValues: setFormValues,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    handleSubmit,
    resetForm
  };
};

export default useForm;