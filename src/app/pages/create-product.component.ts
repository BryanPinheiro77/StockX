import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent {
  produto: Partial<Product> = {
    name: '',
    quantity: 0,
    price: 0
  };

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  salvarProduto() {
    if (!this.produto.name || this.produto.quantity! <= 0 || this.produto.price! <= 0) {
      this.exibirMensagem('Preencha todos os campos corretamente!');
      return;
    }

    const novoProduto: Product = {
      id: Date.now(),  // gera um id único simples
      name: this.produto.name!,
      quantity: this.produto.quantity!,
      price: this.produto.price!
    };

    this.productService.add(novoProduto);
    this.exibirMensagem('Produto criado com sucesso!');
    this.router.navigate(['/']);
  }

  voltar() {
    this.router.navigate(['/']);
  }

  
mensagemFlutuante: string = '';
mostrarMensagem: boolean = false;

exibirMensagem(texto: string, duracaoMs: number = 2500) {
  this.mensagemFlutuante = texto;
  this.mostrarMensagem = true;
  setTimeout(() => {
    this.mostrarMensagem = false;
  }, duracaoMs);
}


}
