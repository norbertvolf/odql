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

  * Implement csrf-token handling
  * Save history to file
  * Implement references description in entity set definition from associations
  * Implement debug parameter to print stack if there is error
  * Implement output sending to pipe for PAGER
  * Implement semi colon as terminator
  * Implement expanded output (\x)
  * Implement expanded LIMIT OFFSET keywords
