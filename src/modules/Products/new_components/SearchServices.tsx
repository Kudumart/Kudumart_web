import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../api/apiFactory";

export default function SearchServices({ query }: { query: string }) {
  const query_props = useQuery({
    queryKey: ["services", query],
    queryFn: async () => {
      const resp = await apiClient.get("/services", {
        params: { q: query },
      });
    },
  });
  return <div></div>;
}
