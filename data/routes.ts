export enum Route {
  Login = '/',
  Products = '/inventory.html',
  Cart = '/cart.html',
}

export namespace Route {
  // Not a true enum member: enum values must be string/number literals, and
  // the product detail page's id query param varies per product, so it can't
  // be a fixed Route string. Merged onto the Route symbol via TS namespace
  // merging so it's still usable as `Route.ProductDetailPattern`.
  export const ProductDetailPattern = /\/inventory-item\.html\?id=\d+$/;
}
