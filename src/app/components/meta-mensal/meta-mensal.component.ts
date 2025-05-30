import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartData, ChartType } from 'chart.js';
import { Firestore, collection, getDocs, doc, getDoc, Timestamp } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Auth, getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-meta-mensal',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './meta-mensal.component.html'
})
export class MetaMensalComponent implements OnInit {
  chartData: ChartData<'doughnut'> = {
    labels: ['Vendas Realizadas', 'Faltante'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#4CAF50', '#FF5252']
      }
    ]
  };

  chartType: ChartType = 'doughnut';

  totalVendas: number = 0;
  metaMensal: number = 0;

  constructor(private firestore: Firestore) {}

  async ngOnInit() {
    await this.carregarMeta();
    await this.calcularVendasDoMes();
    this.atualizarGrafico();
  }

 async carregarMeta() {
  try {
    const configRef = doc(this.firestore, 'configuracoes/usuarioAtual');
    const snapshot = await getDoc(configRef);
    this.metaMensal = snapshot.exists() ? snapshot.data()['metaMensal'] : 10000;
  } catch (err) {
    console.error('Erro ao carregar meta:', err);
  }
}
  async calcularVendasDoMes() {
    const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.error('Usuário não autenticado.');
    return;
  }
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const vendasRef = collection(this.firestore, `usuarios/${user.uid}/vendas`);
    const vendasSnap = await getDocs(vendasRef);

    this.totalVendas = 0;

    vendasSnap.forEach(doc => {
      const venda = doc.data();
      const data = (venda['data'] as Timestamp).toDate();

      if (data >= primeiroDia && data <= hoje) {
        this.totalVendas += venda['total'];
      }
    });
  }

 atualizarGrafico() {
  const restante = Math.max(this.metaMensal - this.totalVendas, 0);
  this.chartData = {
    ...this.chartData,
    datasets: [{
      data: [this.totalVendas, restante],
      backgroundColor: ['#4CAF50', '#FF5252']
    }]
  };
}

}
