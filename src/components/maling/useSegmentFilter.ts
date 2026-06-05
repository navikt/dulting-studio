"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { parseSegmentParam, type Segment, segmentToParam } from "./maling-data";

export function useSegmentFilter(): {
  segment: Segment;
  setSegment: (s: Segment) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const segment = parseSegmentParam(params.get("seg"));

  const setSegment = useCallback(
    (s: Segment) => {
      const next = new URLSearchParams(params.toString());
      const val = segmentToParam(s);
      if (val) next.set("seg", val);
      else next.delete("seg");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return { segment, setSegment };
}
