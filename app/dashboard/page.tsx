import Link from "next/link";

const Page = () => {
    return (
        <div>
            <h2>Welcome to the Dashboard!</h2>
            <Link href={`/dashboard/customers`} className={`block`} >
                Go to Customer Page
            </Link>
            <Link href={`/dashboard/invoices`}  className={`block`}>
                Go Treat some invoices!
            </Link>
        </div>
    );
};

export default Page;