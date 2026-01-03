import { autoserialize } from 'cerialize';
import { Collection } from '../../../core/shared/collection.model';
import { SearchResult } from '../../search/models/search-result.model';

export class CollectionSearchResult extends SearchResult<Collection> {
    @autoserialize
    viewCount: number;
    @autoserialize
    itemCount: number
}
