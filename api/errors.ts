export class OfferNotAvailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfferNotAvailableError";
  }
}
