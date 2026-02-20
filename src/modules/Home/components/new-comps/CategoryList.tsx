import { useNavigate } from "react-router-dom";

interface CategoryListProps {
  data: { name: string; image: string; id: string }[];
}

export default function CategoryList({ data }: CategoryListProps) {
  const navigate = useNavigate();
  return (
    <div className="p-4" data-theme="kudu">
      <h2 className="text-xl font-bold mb-4">Categories</h2>
      <ul className="menu bg-base-100 rounded-box w-full">
        {data.map((category) => (
          <li key={category.id}>
            <a
              onClick={() =>
                navigate(`/products/categories/${category.id}/${category.name}`)
              }
            >
              <img
                src={category.image}
                alt={category.name}
                className="size-6 object-cover rounded"
              />
              <span className="text-sm">{category.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
