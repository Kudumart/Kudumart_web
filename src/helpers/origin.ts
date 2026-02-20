const validate_origin = (addr: string, addr_2: string) => {
  if (!addr || !addr_2) {
    throw new Error("Invalid address");
  }
  return addr === addr_2;
};
