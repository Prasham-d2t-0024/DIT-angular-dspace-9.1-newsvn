import { Route } from "@angular/router";
import { AboutComponent } from "./about.component";
import { i18nBreadcrumbResolverCustom } from "../core/breadcrumbs/i18n-breadcrumbcustom.resolver";

export const ROUTES: Route[] = [
{ 
    path: '',
    resolve: { breadcrumb: i18nBreadcrumbResolverCustom },
    component: AboutComponent,
    data: { title: 'about.page.title', breadcrumbKey: 'custom.page' },
  },
]
