import Link from "next/link";

const Page = () => {
    return (
        <div>
            <h1>Customer Page</h1>
            <Link href={`/dashboard`}>
                Back to Dashboard
            </Link>
        </div>
    );
};

export default Page;