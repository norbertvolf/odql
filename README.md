# odql

SQL Terminal client for OData services

## Installation

 1. Clone repository
 1. Run *npm install*

## Usage

In cloned reposiory run


```
./bin/odql http://services.odata.org/northwind/northwind.svc/
```

## TODO

  * Save history to file
  * Implement debug parameter to print stack if there is error
  * Implement references description in entity set definition from associations
  * Implement output sending to pipe for PAGER
  * Implement semi colon as terminator
  * Implement expanded output (\x)
  * Implement csrf-token handling

## BUGS

  * Show headers for empty recordset
