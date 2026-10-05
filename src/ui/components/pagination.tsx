"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export function Pagination({
	pageInfo,
}: {
	pageInfo: {
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		endCursor?: string | null;
		startCursor?: string | null;
	};
}) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Construct next and previous page URLs based on the current search parameters
	// and the pageInfo provided.
	const nextSearchParams = new URLSearchParams(searchParams);
	nextSearchParams.set("cursor", pageInfo.endCursor ?? "");
	nextSearchParams.set("direction", "next");
	const nextPageUrl = `${pathname}?${nextSearchParams.toString()}`;

	const prevSearchParams = new URLSearchParams(searchParams);
	prevSearchParams.set("cursor", pageInfo.startCursor ?? "");
	prevSearchParams.set("direction", "prev");
	const prevPageUrl = `${pathname}?${prevSearchParams.toString()}`;

	return (
		<nav aria-label="Search results pages" className="flex items-center justify-center gap-x-4 border-neutral-200 px-4 pt-12">
			{pageInfo.hasPreviousPage ? (
				<Link href={prevPageUrl} className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
					Previous
				</Link>
			) : (
				<span aria-disabled="true" className="cursor-not-allowed border px-4 py-2 text-sm font-medium text-neutral-400">
					Previous
				</span>
			)}

			{pageInfo.hasNextPage ? (
				<Link href={nextPageUrl} className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
					Next
				</Link>
			) : (
				<span aria-disabled="true" className="cursor-not-allowed border px-4 py-2 text-sm font-medium text-neutral-400">
					Next
				</span>
			)}
		</nav>
	);
}
