import { AsyncPipe, CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  NgbModal,
  NgbModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { DSONameService } from '../../core/breadcrumbs/dso-name.service';
import { DSpaceObjectDataService } from '../../core/data/dspace-object-data.service';
import { PaginationService } from '../../core/pagination/pagination.service';
import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { getFirstSucceededRemoteDataPayload } from '../../core/shared/operators';
import { SearchService } from '../../core/shared/search/search.service';
import { SearchConfigurationService } from '../../core/shared/search/search-configuration.service';
import { SearchFilterService } from '../../core/shared/search/search-filter.service';
import {
  hasValue,
  isNotEmpty,
} from '../empty.util';
import { BrowserOnlyPipe } from '../utils/browser-only.pipe';
import { currentPath } from '../utils/route.utils';
import { ScopeSelectorModalComponent } from './scope-selector-modal/scope-selector-modal.component';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { Community } from 'src/app/core/shared/community.model';
import { PaginationComponentOptions } from '../pagination/pagination-component-options.model';
import { SortDirection, SortOptions } from 'src/app/core/cache/models/sort-options.model';
import { combineLatest as observableCombineLatest } from 'rxjs';
import { CommunityDataService } from 'src/app/core/data/community-data.service';
import { FollowLinkConfig } from '../utils/follow-link-config.model';

@Component({
  selector: 'ds-base-search-form',
  styleUrls: ['./search-form.component.scss'],
  templateUrl: './search-form.component.html',
  standalone: true,
  imports: [
    AsyncPipe,
    BrowserOnlyPipe,
    FormsModule,
    NgbTooltipModule,
    TranslateModule,
    CommonModule,
    NgbModule
  ],
})
/**
 * Component that represents the search form
 */
export class SearchFormComponent implements OnChanges, OnInit {
  /**
   * The search query
   */
  @Input() query: string;

  /**
   * True when the search component should show results on the current page
   */
  @Input() inPlaceSearch: boolean;

  /**
   * The currently selected scope object's UUID
   */
  @Input()
  scope = '';

  /**
   * Hides the scope in the url, this can be useful when you hardcode the scope in another way
   */
  @Input() hideScopeInUrl = false;

  selectedScope: BehaviorSubject<DSpaceObject> = new BehaviorSubject<DSpaceObject>(undefined);

  @Input() currentUrl: string;

  /**
   * Whether or not the search button should be displayed large
   */
  @Input() large = false;

  /**
   * The brand color of the search button
   */
  @Input() brandColor = 'primary';

  /**
   * The placeholder of the search input
   */
  @Input() searchPlaceholder: string;

  /**
   * Defines whether or not to show the scope selector
   */
  @Input() showScopeSelector = false;

  /**
   * Output the search data on submit
   */
  @Output() submitSearch = new EventEmitter<any>();
  /**
   * The pagination configuration
   */
  config: PaginationComponentOptions;
  /**
  * The pagination id
  */
  pageId = 'tl';
  /**
   * The sorting configuration
   */
  sortConfig: SortOptions;
  currentPageSubscription: Subscription;
  @Input() contenttype: any;
  selectedTeam: string = "123";
  selectedMetadata: any = '';
  selectedMetadataValue: any = '';
  collectionList: any = [];
  suggestionList: any = [];
  metadataFields: any = [];
  communitiesRD$: BehaviorSubject<PaginatedList<Community>> = new BehaviorSubject<PaginatedList<Community>>({} as any);
  linksToFollow: FollowLinkConfig<Community>[] = [];
  constructor(
    protected router: Router,
    protected searchService: SearchService,
    protected searchFilterService: SearchFilterService,
    protected paginationService: PaginationService,
    protected searchConfig: SearchConfigurationService,
    protected modalService: NgbModal,
    protected dsoService: DSpaceObjectDataService,
    public dsoNameService: DSONameService,
    private cds: CommunityDataService,
    private cdRef: ChangeDetectorRef,
  ) {
    this.config = new PaginationComponentOptions();
    this.config.id = this.pageId;
    this.config.pageSize = 1000;
    this.config.currentPage = 1;
    this.sortConfig = new SortOptions('dc.title', SortDirection.ASC);
  }

  ngOnInit(): void {
    this.setMetadataFields();
    this.initPage();
  }

  initPage() {
    const pagination$ = this.paginationService.getCurrentPagination(this.config.id, this.config);
    const sort$ = this.paginationService.getCurrentSort(this.config.id, this.sortConfig);

    this.currentPageSubscription = observableCombineLatest([pagination$, sort$]).pipe(
      switchMap(([currentPagination, currentSort]) => {
        return this.cds.findAll({
          currentPage: currentPagination.currentPage,
          elementsPerPage: 1000,
          sort: { field: currentSort.field, direction: currentSort.direction }
        }, true, false, ...this.linksToFollow,);
      })
    ).subscribe((results) => {
      this.communitiesRD$.next(results.payload);
      this.cdRef.detectChanges();
      // this.pageInfoState$.next(results.payload.pageInfo);
    });
  }

  /**
   * Retrieve the scope object from the URL so we can show its name
   */
  ngOnChanges(): void {
    if (isNotEmpty(this.scope)) {
      this.dsoService.findById(this.scope).pipe(getFirstSucceededRemoteDataPayload())
        .subscribe((scope: DSpaceObject) => this.selectedScope.next(scope));
    }
  }

  /**
   * Updates the search when the form is submitted
   * @param data Values submitted using the form
   */
  onSubmit(data: any) {
    if (isNotEmpty(this.scope)) {
      data = Object.assign(data, { scope: this.scope });
    }
    if (this.selectedMetadata != '' && this.query != '') {
      data[`f.${this.selectedMetadata}`] = this.query + ",contains";
    }
    this.updateSearch(data);
    this.submitSearch.emit(data);
  }

  /**
   * Updates the search when the current scope has been changed
   * @param {string} scope The new scope
   */
  onScopeChange(scope: DSpaceObject) {
    this.updateSearch({ scope: scope ? scope.uuid : undefined });
    this.searchFilterService.minimizeAll();
  }

  /**
   * Updates the search URL
   * @param data Updated parameters
   */
  updateSearch(data: any) {
    const goToFirstPage = { 'spc.page': 1 };

    const queryParams = Object.assign(
      {
        ...goToFirstPage,
      },
      data,
    );
    if (hasValue(data.scope) && this.hideScopeInUrl) {
      delete queryParams.scope;
    }

    void this.router.navigate(this.getSearchLinkParts(), {
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }

  /**
   * @returns {string} The base path to the search page, or the current page when inPlaceSearch is true
   */
  public getSearchLink(): string {
    if (this.inPlaceSearch) {
      return currentPath(this.router);
    }
    return this.searchService.getSearchLink();
  }

  /**
   * @returns {string[]} The base path to the search page, or the current page when inPlaceSearch is true, split in separate pieces
   */
  public getSearchLinkParts(): string[] {
    if (this.inPlaceSearch) {
      return [];
    }
    return this.getSearchLink().split('/');
  }

  /**
   * Open the scope modal so the user can select DSO as scope
   */
  openScopeModal() {
    const ref = this.modalService.open(ScopeSelectorModalComponent);
    ref.componentInstance.scopeChange.pipe(take(1)).subscribe((scope: DSpaceObject) => {
      this.selectedScope.next(scope);
      this.onScopeChange(scope);
    });
  }

  onSelected(value: string): void {
    this.selectedTeam = value;
  }

  onSelectedScope(value: string): void {
    this.scope = value;
  }

  setMetadataFields() {
    this.metadataFields = [
      {
        id: 1,
        label: "Author",
        description: 'Search using the author’s family name. You may use just the family name; include initials or full name if the surname is common. Example: Smith; Smith, Courtney',
        metadata: "dc.author",
        filterKey: "author"
      },
      {
        id: 2,
        label: "Title",
        description: 'Search using at least the first few words of the title. If you know the full title, use it . Example: OceanGliders Oxygen SOP',
        metadata: "dc.title",
        filterKey: "title"
      },
      {
        id: 3,
        label: "Endorsed",
        description: 'Search by the name of the endorsing organization. Example: GOOS,  or if you do not know it, use the Title search field and search for ENDORSED PRACTICE',
        metadata: "obps.endorsementExternal.externalEndorsedBy",
        filterKey: "externalEndorsedBy"
      },
      {
        id: 4,
        label: "Language",
        description: 'Search by the document’s language using the ISO abbreviation. Example: en; es; de; fr; pt. (See the list of language codes: https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)',
        metadata: "dc.language.iso",
        filterKey: "language"
      },
      {
        id: 5,
        label: "EOV",
        description: 'Search for the significant word in the Essential Ocean Variable or its full name. Example: Zooplankton;   Zooplankton biomass and diversity.<br> (See the EOV list : https://goosocean.org/what-we-do/framework/essential-ocean-variables/)',
        metadata: "dc.description.eov",
        filterKey: "eov"
      },
      {
        id: 6,
        label: "SDG",
        description: 'Search by the SDG number, including sub-goals where applicable. Example: 14 or 14.1 or 14.1.1. (See the SDG list for reference: https://sdgs.un.org/goals)',
        metadata: "dc.description.sdg",
        filterKey: "sdg"
      },
      {
        id: 7,
        label: "Journal Title",
        description: 'Search for the full journal title or one or more distinctive words from it. Example: Methods; Remote Sensing of Environment',
        metadata: "dc.bibliographicCitation.title",
        filterKey: "bibliographicCitationTitle"
      },
      {
        id: 8,
        label: "Issuing Agency",
        description: 'Search for the full name of the issuing agency or publisher. Example: UNESCO; European Commission',
        metadata: "dc.publisher",
        filterKey: "publisher"
      },
      {
        id: 9,
        label: "DOI",
        description: 'Search using the DOI. Example: 10.2788/4295; 10.1088/0026-1394/53/1/R1',
        metadata: "dc.identifier.doi",
        filterKey: "doi"
      },
      {
        id: 10,
        label: "EBV",
        description: 'Search for the full name of the EBV. Example: Interaction diversity. (See the EBV list: https://geobon.org/ebvs/what-are-ebvs/)',
        metadata: "dc.description.ebv",
        filterKey: "ebv"
      },
      {
        id: 11,
        label: "ECV",
        description: 'Search for the full name of the ECV. Example: Atmosphere surface pressure. (See the ECV list: https://gcos.wmo.int/site/global-climate-observing-system-gcos/essential-climate-variables)',
        metadata: "dc.description.ecv",
        filterKey: "ecv"
      },
      {
        id: 12,
        label: "Adoption Level",
        description: 'Search using one of the predefined adoption levels: Novel; Validated; Organizational; Multi-Organizational; National; International',
        metadata: "dc.description.adoption",
        filterKey: "adoption"
      },
      {
        id: 13,
        label: "Spatial Coverage",
        description: 'Search using standardized Marine Regions terms. Example: North Atlantic Ocean',
        metadata: "dc.coverage.spatial",
        filterKey: "spatial"
      },
      {
        id: 14,
        label: "Maturity Level",
        description: 'Search using one of the defined maturity levels: Concept ; Pilot or Demonstrated: Mature; N/A',
        metadata: "dc.description.maturitylevel",
        filterKey: "maturitylevel"
      }
    ]
  }

  onMetadataSelected(value) {
    this.selectedMetadataValue = value;
    this.selectedMetadata = this.metadataFields.find(field => field.label === value)?.filterKey || '';
  }

  getPlaceholder(): string {
    const metadata = this.metadataFields.find(field => field.label === this.selectedMetadataValue)?.description;
    return metadata || this.searchPlaceholder;
  }

  sanitizeDescription(desc: string): string {
    return desc?.replace(/<br\s*\/?>/gi, ' ');
  }

  sanitizeDescriptionForTitle(desc: string): string {
    return desc?.replace(/<br\s*\/?>/gi, '\n');
  }
}
