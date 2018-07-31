import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Layouts
import { FullLayoutComponent } from './layouts/full-layout.component';
import { SimpleLayoutComponent } from './layouts/simple-layout.component';
import { LoginComponent } from './login/login.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: SimpleLayoutComponent,
    data: {
      title: 'Home'
  },
    children: [
     
      {
        path: 'login',
        loadChildren: './login/login.module#LoginModule'
      },
      {
        path: 'login/token/:any',
        loadChildren: './login/login.module#LoginModule'
      },
      {
        path: 'components',
        loadChildren: './components/components.module#ComponentsModule'
      },
      {
        path: 'icons',
        loadChildren: './icons/icons.module#IconsModule'
      },
      {
        path: 'widgets',
        loadChildren: './widgets/widgets.module#WidgetsModule'
      },
      {
        path: 'charts',
        loadChildren: './charts/charts.module#chartsModule'
      },
       {
        path: 'project',
        loadChildren: './project/project.module#projectModule'
      }
     
      
    ]
  },
  {
    path: '',
    component: FullLayoutComponent,
    data: {
      title: 'Pages'
    },
    children: [
     {
        path: 'dashboard',
        loadChildren: './dashboard/dashboard.module#DashboardModule'
      },
      
      {
        path: 'superdashboard',
        loadChildren: './superdashboard/superdashboard.module#superDashboardModule'
      },
      {
        path: 'superdashboard',
        loadChildren: './superdashboard/superdashboard.module#superDashboardModule'
      },
      { path: 'editor',      
        loadChildren: './editor/editor.module#editorModule'    
      },
      {
        path: 'user',
        loadChildren: './user/user.module#userModule'
      },
      {
        path: 'project/access_token/:any',
        loadChildren: './project/project.module#projectModule'
      },
      
      {
        path: '',
        loadChildren: './pages/pages.module#PagesModule',
      }
    ]
  }

];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
