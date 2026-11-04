import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../utils";

export default function useRequest(request, initialValue) {
  const requestRef = useRef(request);
  const initialValueRef = useRef(initialValue);
  const [state, setState] = useState({
    data: initialValue,
    loading: true,
    error: "",
  });

  useEffect(() => {
    requestRef.current = request;
    initialValueRef.current = initialValue;
  }, [initialValue, request]);

  const reload = useCallback(async (params = {}) => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const response = await requestRef.current(params);
      const data = response.data?.data ?? initialValueRef.current;
      setState({ data, loading: false, error: "" });
      return data;
    } catch (error) {
      const message = getErrorMessage(error);
      setState({ data: initialValueRef.current, loading: false, error: message });
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;
    requestRef.current()
      .then((response) => {
        if (active) {
          setState({
            data: response.data?.data ?? initialValueRef.current,
            loading: false,
            error: "",
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            data: initialValueRef.current,
            loading: false,
            error: getErrorMessage(error),
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { ...state, reload };
}
