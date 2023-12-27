import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <p>
        Check API on <Link href={"/api/v1/users"}>/api/users</Link>
      </p>
    </div>
  );
}
