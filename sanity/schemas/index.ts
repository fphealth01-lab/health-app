import { articleType } from './article'
import { authorType } from './author'
import { categoryType } from './category'
import { goalType } from './goal'
import { articleCalloutType } from './objects/articleCallout'
import { pullQuoteType } from './objects/pullQuote'
import { supplementReferenceCardType } from './objects/supplementReferenceCard'

export const schemaTypes = [
  goalType,
  categoryType,
  authorType,
  articleCalloutType,
  supplementReferenceCardType,
  pullQuoteType,
  articleType,
]
