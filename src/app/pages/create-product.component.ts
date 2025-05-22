import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { CategoryService } from '../services/category.service';
@Component({
  selector: 'app-create-product',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css']
})
export class CreateProductComponent {
  produto: Omit<Product, 'id'> = {
    name: '',
    price: 0,
    quantity: 0,
    category: '',
    cost: 0,
  };

  categorias: string[] = [];

  mensagemFlutuante: string = '';
  mostrarMensagem: boolean = false;
  tipoMensagem: 'normal' | 'alerta' = 'normal';

  constructor(
    private productService: ProductService,
    private router: Router,
    private categoryService: CategoryService
  ) {
    this.carregarCategorias();
  }

  carregarCategorias() {
     this.categoryService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias:', error);
      }
    });
  }

  async salvarProduto() {
    try {
      if (!this.produto.name || this.produto.price <= 0 || this.produto.quantity < 0) {
        this.exibirMensagem('Preencha os campos obrigatórios corretamente.', 'alerta');
        return;
      }

      await this.productService.add(this.produto);
      this.exibirMensagem('Produto criado com sucesso!');
      
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      this.exibirMensagem('Erro ao salvar produto.', 'alerta');
    }
  }

  voltar() {
    this.router.navigate(['/']);
  }

  exibirMensagem(texto: string, tipo: 'normal' | 'alerta' = 'normal', duracaoMs: number = 2500) {
    this.mensagemFlutuante = texto;
    this.tipoMensagem = tipo;
    this.mostrarMensagem = true;

    setTimeout(() => {
      this.mostrarMensagem = false;
    }, duracaoMs);
  }
}
