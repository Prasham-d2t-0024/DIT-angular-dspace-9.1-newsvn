import { AsyncPipe } from '@angular/common';
import {
  Component,
  OnInit,
} from '@angular/core';
import {
  Params,
  RouterLink,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouteService } from 'src/app/core/services/route.service';

import { BBM_PAGINATION_ID } from '../../../browse-by/browse-by-metadata/browse-by-metadata.component';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { PaginationService } from '../../../core/pagination/pagination.service';
import { BrowseEntry } from '../../../core/shared/browse-entry.model';
import { ViewMode } from '../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../object-collection/shared/listable-object/listable-object.decorator';
import { AbstractListableElementComponent } from '../../object-collection/shared/object-collection-element/abstract-listable-element.component';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'ds-browse-entry-list-element',
  styleUrls: ['./browse-entry-list-element.component.scss'],
  templateUrl: './browse-entry-list-element.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterLink,
  ],
})

/**
 * This component is automatically used to create a list view for BrowseEntry objects when used in ObjectCollectionComponent
 */
@listableObjectComponent(BrowseEntry, ViewMode.ListElement)
export class BrowseEntryListElementComponent extends AbstractListableElementComponent<BrowseEntry> implements OnInit {
  /**
   * Emits the query parameters for the link of this browse entry list element
   */
  queryParams$: Observable<Params>;
  showOrcidIcon:boolean = false;

  constructor(
    public dsoNameService: DSONameService,
    protected paginationService: PaginationService,
    protected routeService: RouteService,
    public sanitizer: DomSanitizer,
  ) {
    super(dsoNameService);
  }

  ngOnInit() {
    this.queryParams$ = this.getQueryParams();
  }

  /**
   * Get the query params to access the item page of this browse entry.
   */
  private getQueryParams(): Observable<Params> {
    const pageParamName = this.paginationService.getPageParam(BBM_PAGINATION_ID);
    return this.routeService.getQueryParameterValue(pageParamName).pipe(
      map((currentPage) => {
        return {
          value: this.object.value,
          authority: this.object.authority ? this.object.authority : undefined,
          startsWith: undefined,
          [pageParamName]: null,
          [BBM_PAGINATION_ID + '.return']: currentPage,
        };
      }),
    );
  }

  getObjectValue(value){
    this.showOrcidIcon = false;
    if(!value.includes('[')) return value;

    this.showOrcidIcon = true;
    return value.split('[')[0];
  }

  getasfalink(link: string) {
    let orcidBaseUrl = "https://orcid.org/";
    let extractedLink = link;

    if (link.includes("[")) {
      extractedLink = link.split("[")[1].split("]")[0];
    }

    // Ensure the ORCID link is correctly formatted
    if (!extractedLink.startsWith(orcidBaseUrl)) {
      extractedLink = orcidBaseUrl + extractedLink;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(extractedLink);
  }

}
