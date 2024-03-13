function getData<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    resolve(data);
  });
}
export async function Product({ product }: { product: string }) {
  const data = await getData("Product");
  return (
    <div className="product">
      {product} - {data}
    </div>
  );
}
export async function ProductList() {
  const data = await getData("Description");
  const products = await getData(["P1", "P2", "P3", "P4"]);
  return (
    <div className="product-list">
      <h1>Title</h1>
      <p>{data}</p>

      {products.map((p) => (
        <Product product={p} />
      ))}
    </div>
  );
}
