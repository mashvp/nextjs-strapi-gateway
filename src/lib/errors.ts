type Details<T = {}> = Record<string, any> & T;

export class NextjsStrapiGatewayError<T> extends Error {
  details: Details<T> | undefined;

  constructor(message: string, details?: Details<T>) {
    super(message);
    this.details = details;
  }
}
