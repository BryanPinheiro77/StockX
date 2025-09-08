import {
  Component,
  ViewChild,
  OnInit,
  ChangeDetectorRef,
  NgZone
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators
} from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { Observable } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { VendaService } from '../../services/venda.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-venda',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZXingScannerModule,
    NavbarComponent
  ],
  templateUrl: './venda.component.html',
  styleUrls: ['./venda.component.css']
})
export class VendaComponent implements OnInit {

  @ViewChild(ZXingScannerComponent)
  scanner?: ZXingScannerComponent;

  allowedFormats = [
    BarcodeFormat.QR_CODE,
    BarcodeFormat.EAN_13,
    BarcodeFormat.CODE_128
  ];

  mensagemFlutuante: string = '';
  mostrarMensagem: boolean = false;
  tipoMensagem: 'normal' | 'alerta' = 'normal';

  mostrarScanner: boolean = false;
  scannerRunning: boolean = false;
  hasPermission: boolean = false;

  vendaForm!: FormGroup;
  produtos: Product[] = [];
  produtosFiltrados: Observable<Product[]>[] = [];

  currentDevice?: MediaDeviceInfo;
  availableDevices: MediaDeviceInfo[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private vendaService: VendaService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  async ngOnInit() {
    this.vendaForm = this.fb.group({
      formaPagamento: ['', Validators.required],
      itens: this.fb.array([this.criarItem()])
    });

    this.produtos = await this.productService.getAll();
    this.configurarAutocompleteParaItem(0);
  }

  ngAfterViewInit(): void {
  setTimeout(() => {
    if (this.scanner) {
      this.scanner.permissionResponse?.subscribe((hasPermission: boolean) => {
        this.ngZone.run(() => {
          this.hasPermission = hasPermission;
        });
      });

      this.scanner.camerasFound?.subscribe((devices: MediaDeviceInfo[]) => {
        this.ngZone.run(() => {
          this.availableDevices = devices;
          if (devices.length > 0) {
            this.currentDevice = devices[0];
          }
        });
      });
    }
  });
}

  get itens(): FormArray {
    return this.vendaForm.get('itens') as FormArray;
  }

  criarItem(): FormGroup {
    return this.fb.group({
      nome: ['', Validators.required],
      codigo: [''],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      preco: [0, Validators.required],
      categoria: ['']
    });
  }

  adicionarItem(): void {
    this.itens.push(this.criarItem());
    this.configurarAutocompleteParaItem(this.itens.length - 1);
  }

  removerItem(index: number): void {
    this.itens.removeAt(index);
    this.produtosFiltrados.splice(index, 1);
  }


  mostrarSugestoes(i: number): boolean {
  const nome = this.itens.at(i).get('nome')?.value;
  return nome && nome.trim().length > 0;
}

  configurarAutocompleteParaItem(index: number): void {
    const nomeControl = this.itens.at(index).get('nome');
    if (nomeControl) {
      const filtro$ = nomeControl.valueChanges.pipe(
        startWith(''),
        debounceTime(200),
        map((valor: string) => this.filtrarProdutos(valor))
      );
      this.produtosFiltrados[index] = filtro$;
    }
  }

  filtrarProdutos(valor: string): Product[] {
    const termo = valor?.toLowerCase() || '';
    return this.produtos.filter(p =>
      p.name?.toLowerCase().includes(termo) || p.id?.toLowerCase().includes(termo)
    );
  }

  ngOnDestroy() {
  // Não tentar resetar se já está fechado
  if (!this.mostrarScanner && !this.scannerRunning) return;
  
  // Fechar de forma limpa
  this.mostrarScanner = false;
  this.scannerRunning = false;
  
  // Resetar sem esperar para evitar problemas no ciclo de vida
  if (this.scanner) {
    try {
      this.scanner.reset();
    } catch (error) {
      // Ignorar erros durante a destruição
    }
  }
}

  selecionarProduto(produto: Product, index: number): void {
    const item = this.itens.at(index);
    item.patchValue({
      nome: produto.name,
      codigo: produto.id,
      preco: produto.price,
      categoria: produto.category
    });
  }

  calcularTotal(): number {
    return this.itens.controls.reduce((total, item) => {
      const qtd = item.get('quantidade')?.value || 0;
      const preco = item.get('preco')?.value || 0;
      return total + qtd * preco;
    }, 0);
  }

  async finalizarVenda(): Promise<void> {
    if (this.vendaForm.invalid) {
      alert('Formulário inválido, preencha todos os campos corretamente!');
      return;
    }

    const venda = {
      formaPagamento: this.vendaForm.value.formaPagamento,
      itens: this.vendaForm.value.itens,
      total: this.calcularTotal(),
      data: new Date()
    };

    try {
      for (const item of venda.itens) {
        const produtoEstoque = this.produtos.find(p => p.id === item.codigo);
        if (produtoEstoque) {
          const quantidadeVendida = Number(item.quantidade);
          if (produtoEstoque.quantity < quantidadeVendida) {
            alert(`Estoque insuficiente para o produto ${produtoEstoque.name}.`);
            return;
          }
        }
      }

      await this.vendaService.salvarVenda(venda);
      alert('Venda salva e estoque atualizado com sucesso!');
      this.vendaForm.reset();
      this.itens.clear();
      this.adicionarItem();
    } catch (error) {
      console.error('Erro ao salvar venda ou atualizar estoque:', error);
      alert('Erro ao salvar a venda ou atualizar o estoque. Tente novamente.');
    }
  }

  async toggleScanner(): Promise<void> {
  // Se já está visível, apenas desligue
  if (this.mostrarScanner) {
    this.mostrarScanner = false;
    this.scannerRunning = false;
    return;
  }

  // Configuração inicial
  this.mostrarScanner = true;
  this.scannerRunning = false;

  try {
    // Espera a renderização do componente
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!this.scanner) {
      throw new Error('Scanner component not initialized');
    }

    // Verificação de permissão
    this.hasPermission = await this.scanner.askForPermission();
    if (!this.hasPermission) {
      throw new Error('Permissão da câmera negada');
    }

    // Verificação de dispositivos com timeout
    if (this.availableDevices.length === 0) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject('Nenhuma câmera encontrada'), 5000);
        
        const sub = this.scanner!.camerasFound.subscribe(devices => {
          clearTimeout(timeout);
          if (devices.length > 0) {
            this.availableDevices = devices;
            resolve();
          } else {
            reject('Nenhuma câmera disponível');
          }
          sub.unsubscribe();
        });
      });
    }

    // Configuração do dispositivo
    this.currentDevice = this.availableDevices[0];
    this.scanner.device = this.currentDevice;
    
    // Inicia o scanner
    this.scannerRunning = true;

  } catch (error) {
    this.handleScannerError(error);
    this.mostrarScanner = false;
    this.scannerRunning = false;
  }
}

private handleScannerError(error: unknown): void {
  let errorMessage = 'Erro no scanner';
  
  if (error instanceof Error) {
    console.error('Scanner error:', error);
    
    if (error.name === 'NotReadableError') {
      errorMessage = 'A câmera não pode ser acessada. Verifique se não está sendo usada por outro aplicativo.';
    } else if (error.name === 'NotAllowedError') {
      errorMessage = 'Permissão para usar a câmera foi negada.';
    } else if (error.message.includes('No scanning is running')) {
      // Não mostrar mensagem para esse erro específico
      return;
    } else {
      errorMessage = error.message;
    }
  }

  this.exibirMensagem(errorMessage, 'alerta');
}



  onScanError(error: any): void {
    console.error('Erro ao escanear:', error);
    this.ngZone.run(() => {
      if (error.name === 'NotReadableError') {
        this.exibirMensagem('A câmera está em uso por outro aplicativo ou bloqueada.', 'alerta');
      } else if (error.name === 'NotAllowedError') {
        this.exibirMensagem('Permissão para câmera negada.', 'alerta');
      } else {
        this.exibirMensagem('Erro ao acessar a câmera: ' + error.message, 'alerta');
      }
      this.mostrarScanner = false;
      this.scannerRunning = false;
      this.safeResetScanner();
    });
  }



 camerasFound(devices: MediaDeviceInfo[]): void {
  this.ngZone.run(() => {
    this.availableDevices = devices;
    if (devices.length > 0) {
      this.currentDevice = devices[0]; // ou permitir o usuário escolher depois
      if (this.scanner) {
        try {
          this.scanner.reset();  // reset para liberar câmera antiga
          this.scanner.device = this.currentDevice;  // atualiza dispositivo
        } catch (error) {
          console.warn('Erro ao resetar scanner:', error);
        }
      }
    } else {
      this.exibirMensagem('Nenhuma câmera encontrada.', 'alerta');
      this.mostrarScanner = false;
    }
  });
}

  onHasPermission(has: boolean): void {
    this.ngZone.run(() => {
      this.hasPermission = has;
      console.log('Permissão da câmera:', has);
    });
  }


  onScanStart(): void {
    this.ngZone.run(() => {
      this.scannerRunning = true;
      this.exibirMensagem('Escaneamento iniciado.');
    });
  }

  onScanStop(): void {
    this.ngZone.run(() => {
      this.scannerRunning = false;
      this.exibirMensagem('Escaneamento parado.');
    });
  }

  private async safeResetScanner(): Promise<void> {
  if (!this.scanner) return;

  try {
    // Método mais seguro para v19.0.0
    if (this.scannerRunning) {
      await this.scanner.scanStop();
      // Delay para garantir que o scanner parou
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    // Ignora erros específicos da versão 19
    if (!(error instanceof Error) || 
        !error.message.includes('No scanning is running')) {
      console.warn('Aviso ao resetar scanner:', error);
    }
  } finally {
    this.scannerRunning = false;
  }
}

indiceAtivo = 0;

onCampoNomeFocado(index: number) {
  this.indiceAtivo = index;
}

  onCodeScanned(code: string): void {
    this.mostrarScanner = false;
    this.scannerRunning = false;

    const produtoEncontrado = this.produtos.find(
      p => p.id === code || p.code === code
    );

    if (!produtoEncontrado) {
      alert('Produto não encontrado com este código.');
      return;
    }

    const novoItem = this.criarItem();
    novoItem.patchValue({
      nome: produtoEncontrado.name,
      codigo: produtoEncontrado.id,
      preco: produtoEncontrado.price,
      categoria: produtoEncontrado.category
    });

    this.itens.push(novoItem);
    this.configurarAutocompleteParaItem(this.itens.length - 1);
  }

  // Navegações
  irParaProdutos() {
    this.router.navigate(['/produtos']);
  }
  abrirDashboard() {
    this.router.navigate(['']);
  }
  irParaVendas() {
    this.router.navigate(['/venda']);
  }
  irParaConfiguracoes() {
    this.router.navigate(['/configurações']);
  }

  exibirMensagem(texto: string, tipo: 'normal' | 'alerta' = 'normal', duracaoMs: number = 2500) {
    this.mensagemFlutuante = texto;
    this.tipoMensagem = tipo;
    this.mostrarMensagem = true;
    setTimeout(() => this.mostrarMensagem = false, duracaoMs);
  }
}
