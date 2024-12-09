import { Store } from '@/models/Store';
import { ApiManager } from './managers/ApiManager';
import { Product } from '@/models/Product';
import { ProductCreate } from '@/models/viewModels/ProductCreate';
import { ProductUpdate } from '@/models/viewModels/ProductUpdate';

export async function getAllStores(): Promise<{ "stores": Store[] }> {
    console.log('LINKA-LOG: getAllStores called');
    const response = await ApiManager.get('/product/store');
    return response.data as { "stores": Store[] };
}

export async function getProductById(id: string): Promise<Product> {
    console.log(`LINKA-LOG: getProductById called with id: ${id}`);
    const response = await ApiManager.get(`/product/${id}`);
    return response.data.product as Product;
}

export async function addProduct(product: ProductCreate): Promise<ProductCreate> {
    console.log('LINKA-LOG: addProduct called with product:', product);
    const response = await ApiManager.post('/product', JSON.stringify(product));
    return response.data as ProductCreate;
}

export async function updateProduct(updateData: ProductUpdate): Promise<void> {
    console.log('LINKA-LOG: updateProduct called with updateData:', updateData);
    const response = await ApiManager.patch('/product', JSON.stringify(updateData));
}

export async function deleteProductById(id: string): Promise<void> {
    console.log(`LINKA-LOG: deleteProductById called with id: ${id}`);
    await ApiManager.delete(`/product/${id}`);
}

export async function getProductsByOrganization(): Promise<Product[]> {
    console.log('LINKA-LOG: getProductsByOrganization called');
    const response = await ApiManager.get('/product/organization');
    return response.data.products as Product[];
}
