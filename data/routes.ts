export enum Route {
  Login = '/',
  Products = '/inventory.html',
  Cart = '/cart.html',
  CheckoutInfo = '/checkout-step-one.html',
}

// Not a true enum member: enum values must be string/number literals, and the
// product detail page's id query param varies per product, so it can't be a
// fixed Route string. Merged onto the Route symbol via TS namespace merging
// (deliberate, not a general-purpose namespace) so it's still usable as
// `Route.ProductDetailPattern`.
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Route {
  export const ProductDetailPattern = /\/inventory-item\.html\?id=\d+$/;
}
