# Wprowadzenie

Zadanie dotyczy prezentacji (osadzenia) wydarzeń w terminarzu. W celu uniknięcia przysłaniania danych, musimy rozwiązać kolizję nachodzących na siebie wydarzeń.
Obecna funkcja układa kolidujące wydarzenia jedno po drugim i marnuje przy tym trochę miejsca.

Wydarzenia układane są w terminarzu za pomocą czterech parametrów:
```ts
interface Dto {
  left: number;   // Przesunięcie od lewej, 1 = 100%
  width: number;  // Szerokość wydarzenia względem szablonu, 1 = 100%
  dateFrom: Date; // Przesunięcie od góry
  dateTo: Date;   // dateTo - dateFrom = wysokość wydarzenia
}
```

Kolizje prezentowane są poziomowo, więc interesują nas głównie parametry `left` oraz `width` (wydarzenia kolidują ze sobą jeżeli ich czas `dateFrom` i `dateTo` się pokrywa).
Np. aby umieścić cztery wydarzenia obok siebie, wartości muszą prezentować się następująco:
```
[
  { left: 0, width: 0.25 },
  { left: 0.25, width: 0.25 },
  { left: 0.5, width: 0.25 },
  { left: 0.75, width: 0.25 },
]
```

Aby wszystkie wydarzenia mieściły się na ekranie suma `left` i `width` nie może przekraczać 100% (1).

# Zadanie

### Dane wejściowe:
* A = 08:00 - 09:00  
* B = 08:30 - 10:30  
* C = 10:00 - 11:00  
* D = 12:00 - 13:00
* E = 13:00 - 14:00
* F = 13:00 - 14:00
* G = 13:00 - 14:00

### Obecne działanie funkcji: 
```
-----
| A |-----
-----|   |
     | B |
     |   |-----
     -----| C |
          -----

---------------
|      D      |
---------------
----|----|-----
| E |  F |  G | 
----|----|-----
```

### Oczekiwany efekt:
```
-------
|  A  |------
------|     |
      |  B  |
------|     |
|  C  |------
-------

-------------
|     D     |
-------------
----|---|----
| E | F | G | 
----|---|----
```

Twoim zadaniem jest zmiana działania funkcji `resolveTimeCollisions`, aby zwracała dane w postaci oczekiwanego efektu.
Możesz zmienić dowolną ilość kodu, jedyne co ma pozostać niezmienione to testy.

Zapoznaj się z plikiem index.test.ts, aby poznać specyfikacje funkcji.
Zadanie będzie oceniane wstępnie za pomocą `npm run test`.

Jeśli zadanie przyjdzie Ci łatwo, to możesz zaskoczyć nas wizualizacją problemu.

Rozwiązanie podeślij na rekrutacja@asco.com.pl
Powodzenia :)