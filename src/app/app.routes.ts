import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CreateProductComponent } from './pages/create-product.component';
import { EditProductComponent } from './pages/edit/edit-product/edit-product.component';

export const routes: Routes = [
    {
    path: "",
    component: HomeComponent
    },
    { path: 'novo-produto',
        component: CreateProductComponent
    },
    {
        path: 'editar-produto/:id',
        component: EditProductComponent
    }
];
