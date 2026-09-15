import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityEnquiryCTA } from '../src/components/events/ActivityEnquiryCTA'

describe('ActivityEnquiryCTA', () => {
    it('shows the enquiry address, which is the only route for getting in touch', () => {
        render(<ActivityEnquiryCTA />)
        expect(screen.getByText('info@penmaenandnicholastonvh.co.uk')).toBeInTheDocument()
    })

    it('says what to include, since nothing prefills the message any more', () => {
        render(<ActivityEnquiryCTA />)
        expect(screen.getByText(/what you'd like to run, how often/i)).toBeInTheDocument()
    })
})
