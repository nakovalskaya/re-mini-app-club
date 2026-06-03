import { handleImageProxy } from "../server/imageProxy.js";

export default async function handler(request: any, response: any) {
  await handleImageProxy(request, response);
}
