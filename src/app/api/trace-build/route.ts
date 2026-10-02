import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

const SHA_PATTERN = /^[a-f0-9]{40}$/;

export function GET() {
	const revision = process.env.VERCEL_GIT_COMMIT_SHA?.trim().toLowerCase();
	const deploymentId = process.env.VERCEL_DEPLOYMENT_ID?.trim();
	const backendUrl = process.env.NEXT_PUBLIC_SALEOR_API_URL?.trim();
	const channel = process.env.NEXT_PUBLIC_DEFAULT_CHANNEL?.trim();

	if (!revision || !SHA_PATTERN.test(revision) || !deploymentId || !backendUrl || !channel) {
		return NextResponse.json(
			{ schema_version: 1, status: "UNAVAILABLE" },
			{ status: 503, headers: { "Cache-Control": "no-store" } },
		);
	}

	return NextResponse.json(
		{
			schema_version: 1,
			status: "READY",
			revision,
			deployment_id: deploymentId,
			backend_fingerprint: createHash("sha256").update(backendUrl).digest("hex"),
			channel,
		},
		{ headers: { "Cache-Control": "no-store" } },
	);
}
