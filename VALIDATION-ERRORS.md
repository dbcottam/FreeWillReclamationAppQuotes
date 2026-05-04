# Validation Errors

The generator exits with status code `1` and prints grouped errors when content is invalid.

Examples:

```text
Content generation failed:

- daily-quotes: missing required CSV columns: day
- Row 4: day must be a positive integer. Received "abc".
- quotes: duplicate id "viktor-frankl-change"
- quotes: schema error at /quotes/2/categories/0 must be equal to one of the allowed values. Allowed: courage, encouragement, healing, hope, identity, peace, perseverance, purpose, wisdom.
```
