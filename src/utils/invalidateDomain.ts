import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type Domain = "part" | "category" | "material" | "bom" | "carModel";

const AFFECTED: Record<Domain, QueryKey[]> = {
  part: [["part"], ["bom"], ["carModel"], ["dashboard"]],
  category: [["category"], ["part"], ["carModel"]],
  material: [["material"], ["bom"]],
  bom: [["bom"], ["dashboard"]],
  carModel: [["carModel"], ["part"]],
};

export function invalidateDomain(queryClient: QueryClient, domain: Domain) {
  return Promise.all(
    AFFECTED[domain].map((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    )
  );
}
