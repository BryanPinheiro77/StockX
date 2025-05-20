import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private key = 'estoque_produtos';

  getAll(): Product[] {
  const data = localStorage.getItem(this.key);
  console.log('🔍 Dados brutos do localStorage:', data); // <--- AQUI
  const produtos = data ? JSON.parse(data) : [];
  console.log('📦 Produtos convertidos:', produtos);     // <--- E AQUI
  return produtos;
}


  saveAll(products: Product[]) {
    localStorage.setItem(this.key, JSON.stringify(products));
  }

  private getNextId(): number {
    const produtos = this.getAll();
    if (produtos.length === 0) return 1;
    // pega o maior id já existente e soma 1
    const maxId = produtos.reduce((max, p) => p.id > max ? p.id : max, 0);
    return maxId + 1;
  }

  add(product: Product) {
    const produtos = this.getAll();
    product.id = this.getNextId();  // usa id sequencial
    produtos.push(product);
    this.saveAll(produtos);
  }

 getProductById(id: number): Product | undefined {
  const produtos = this.getAll();
  return produtos.find(p => p.id === id);
}

updateProduct(updated: Product) {
  let produtos = this.getAll();
  produtos = produtos.map(p => p.id === updated.id ? updated : p);
  this.saveAll(produtos);
}

  delete(id: number) {
    const produtos = this.getAll().filter(p => p.id !== id);
    this.saveAll(produtos);
  }

  getResumo() {
    const produtos = this.getAll();
    const totalItens = produtos.reduce((acc, p) => acc + p.quantity, 0);
    const totalValor = produtos.reduce((acc, p) => acc + p.quantity * p.price, 0);
    return { totalItens, totalValor };
  }

  seedData() {
  const produtos = this.getAll();
  if (produtos.length === 0) {
    const iniciais: Product[] = [
      { id: 1, name: 'Mouse Gamer', quantity: 10, price: 120 },
      { id: 2, name: 'Teclado Mecânico', quantity: 5, price: 280 },
      { id: 3, name: 'Monitor 24', quantity: 2, price: 900 },
    ];
    this.saveAll(iniciais);
    console.log('✅ Produtos iniciais adicionados!');
  } else {
    console.log('ℹ️ Já existem produtos. Seed não necessário.');
  }
}

}
