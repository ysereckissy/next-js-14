'use server';

import {z} from "zod";
import {sql} from "@vercel/postgres";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import exp from "constants";
import {signIn} from "@/auth";

const InvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer'
    }),
    amount: z.coerce
        .number()
        .gt(0, {message: 'Please enter an amount greater than $0'}),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.'
    }),
    date: z.string(),
});
const CreateInvoice = InvoiceSchema.omit({id: true, date: true});

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}
export const createInvoice = async (prevState: State, formData: FormData) => {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    /// if form validation fails, return errors early. Otherwise, continue
    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        }
    }
    const {customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    try {
            await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
        revalidatePath(`/dashboard/invoices`);
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice',
        }
    }
    redirect(`/dashboard/invoices`);
}

const UpdateInvoice = InvoiceSchema.omit({ date: true });
export const updateInvoice = async (id: string, prevState: State, formData: FormData) => {
        const validatedFields = UpdateInvoice.safeParse({
        id: formData.get('id'),
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    }) ;
        if(!validatedFields.success) {
            return {
                errors: validatedFields.error.flatten().fieldErrors,
                message: 'Missing fields. Failed to Update Invoice.'
            }
        }
    const {customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    try {
            await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
        `;
        revalidatePath('/dashboard/invoices');
    } catch (error) {
        return {
            message: 'Database Error: Failed to Update Invoice',
        }
    }
    redirect('/dashboard/invoices');
}

const DeleteInvoice = InvoiceSchema.pick({ id: true});

export const deleteInvoice = async (formData: FormData) => {
    const id = formData.get('id')?.toString();
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Invoice.',
        }
    }
}

export const authenticate = async (
    prevSate: string | undefined,
    formData: FormData,
) => {
    try {
        await signIn('credentials', Object.fromEntries(formData));
    } catch (error) {
        if((error as Error).message.includes('CredentialsSignin')) {
            return 'CredentialsSignin';
        }
        throw Error;
    }
}