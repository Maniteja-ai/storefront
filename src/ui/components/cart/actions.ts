"use server";

import { revalidatePath } from "next/cache";
import { executeAuthenticatedGraphQL } from "@/lib/graphql";
import { CheckoutDeleteLinesDocument, CheckoutLinesUpdateDocument } from "@/gql/graphql";
import * as Checkout from "@/lib/checkout";

export type CartActionResult = { success: true } | { success: false; message: string };

export async function deleteCartLine(checkoutId: string, lineId: string): Promise<CartActionResult> {
	const result = await executeAuthenticatedGraphQL(CheckoutDeleteLinesDocument, {
		variables: {
			checkoutId,
			lineIds: [lineId],
		},
		cache: "no-cache",
	});
	if (!result.ok) {
		return { success: false, message: "We couldn't remove this item. Please try again." };
	}
	if (result.data.checkoutLinesDelete?.errors.length) {
		return { success: false, message: "We couldn't remove this item. Please try again." };
	}

	// If cart is now empty, clear the checkout cookie to start fresh next time
	const checkout = result.data.checkoutLinesDelete?.checkout;
	if (checkout && checkout.lines.length === 0) {
		await Checkout.clearCheckoutCookie(checkout.channel.slug);
	}

	revalidatePath("/cart");
	revalidatePath("/");
	return { success: true };
}

export async function updateCartLineQuantity(
	checkoutId: string,
	lineId: string,
	quantity: number,
): Promise<CartActionResult> {
	if (quantity < 1) {
		return deleteCartLine(checkoutId, lineId);
	}

	const result = await executeAuthenticatedGraphQL(CheckoutLinesUpdateDocument, {
		variables: {
			checkoutId,
			lines: [{ lineId, quantity }],
		},
		cache: "no-cache",
	});
	if (!result.ok) {
		return { success: false, message: "We couldn't update this quantity. Please try again." };
	}
	const mutationErrors = result.data.checkoutLinesUpdate?.errors;
	if (mutationErrors?.length) {
		return {
			success: false,
			message: mutationErrors[0]?.message || "We couldn't update this quantity. Please try again.",
		};
	}

	revalidatePath("/cart");
	revalidatePath("/");
	return { success: true };
}
