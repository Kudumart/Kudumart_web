export const extract_message = (data: any) => {
  const api_error = data.response?.data?.message;
  if (api_error) {
    return api_error;
  }
  return data.message;
};
