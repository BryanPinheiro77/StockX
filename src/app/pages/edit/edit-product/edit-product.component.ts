import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';  // IMPORTAR FormsModule
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, FormsModule],  // <- aqui, CommonModule adicionado
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit {
  id!: number;
  produto: Product = {
    id: 0,
    name: '',
    quantity: 0,
    price: 0
  };

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    const prod = this.productService.getProductById(this.id);
    if (prod) {
      this.produto = { ...prod };
    } else {
      alert('Produto não encontrado!');
      this.router.navigate(['/']);
    }
  }

  atualizarProduto(): void {
  this.productService.updateProduct(this.produto);

  let mensagemEstoqueBaixo = '';
  if (this.produto.quantity <= 2) {
    mensagemEstoqueBaixo = `⚠ Estoque baixo: "${this.produto.name}" tem apenas ${this.produto.quantity} unidade(s)!`;
  }

  this.exibirMensagem('Produto atualizado com sucesso!');

  setTimeout(() => {
    this.router.navigate(['/'], {
      state: { mensagemEstoqueBaixo }  // 👈 envia para o componente da home
    });
  }, 1100);
}


  cancelar() {
    this.router.navigate(['/']);
  }

  mensagemFlutuante: string = '';
mostrarMensagem = false;

exibirMensagem(texto: string, duracaoMs: number = 2500) {
  this.mensagemFlutuante = texto;
  this.mostrarMensagem = true;
  setTimeout(() => {
    this.mostrarMensagem = false;
  }, duracaoMs);
}
}
