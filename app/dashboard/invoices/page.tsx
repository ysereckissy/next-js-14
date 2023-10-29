import Link from "next/link";

const Page = () => {
    return (
        <div>
            <h1>Invoices Page</h1>
            <Link href={`/dashboard`} className={`block`}>Back to Dashboard</Link>
        </div>
    );
};
export default Page;