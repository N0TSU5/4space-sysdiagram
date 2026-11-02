The release boundary. Nothing reaches Merlin without passing this stage.

## Steps

- Permanently strip all pseudonymous `device_key` values
- Enforce the Floor of 5: suppress cells with fewer than 5 distinct panel devices
- Apply secondary sibling suppression
- Round exported counts to multiples of 5
