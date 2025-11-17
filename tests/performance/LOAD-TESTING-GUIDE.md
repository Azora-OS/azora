/)
ing-guidestestdocs/6.io/https://king Guide](ce TestrformanPe)
- [g/estin-tdes/loadesting-gui/docs/tttps://k6.ios](h Practice Best [k6)
-t-api/cripasavk6.io/docs/jhttps://rence](6 API Refe)
- [kk6.io/docs/](https://cumentationDo
- [k6 s
erence

## Reftlenecksfy botdenti I logs
   -eck errores
   - Chercentil and p99 pw p95  - Reviesults**
 *Analyze re. *points

5ng ify breakise to identrea inclly Gradua
   -ntsouower VU cwith lrt    - Staease**
 incradradual lo **G I/O

4. - Disk
  idthwork bandw - Net
  sagey u   - Memorge
sa - CPU urces**
  our system res. **Monitozation

3imiopt after  results - Compare changes
  ing before mak - Run testsation**
  izbefore optime . **Baselin
2
hoursuring peak uction dainst prodn agt ru - Don'onment
  est enviricated tging or dedta sUse- *
   nment*ated enviro in isolests*Run tes

1. *Practic# Best 
#``
5536
`limit -n 6macOS)
ux/ limit (Linuorriptsc deilese f Increa`bash
#
``Filesen  Too Many Opory

###e memor with mn machine- Run oon
ratice test dudut
- Recounuce VU Redemory
- # Out of M
##
:5175
```ocalhosturl http://ling
c is runnify frontend Ver

#pi/health/aost:4000ocalhttp://l
curl hr is runningI serveerify AP`bash
# V
``fusedtion ReConnec
### e
```
steps abovnstallation , follow iinstalled not ion

# Ifversed
k6 llis insta# Verify k6 bash

```6 Not Found## khooting

## Troublesrate

#che hit e_hits`: Cats
- `cachled requesf faiCount o: uests`_reqledts
- `fail reques successfuunt ofCos`: questessful_reucce flow
- `serprisntete ee to complon`: Timw_duratise_flo
- `enterprigken earninplete to comTime toduration`: rning_token_ea
- `purchasecourse lete e to compon`: Timatiurase_drse_purch`couw
- ion flocripte subs completTime toion`: n_duratiptio:
- `subscrtricstom melude cussts inc load teMetrics
Theustom ### C`

rent.js
``00-concurload-test-10ormance//perfcloud tests
k6 ```bash
(k6 Cloud)d Testing ou Cl
###`
.js
``rent00-concurd-test-10e/loarformancsts/pet 2:1/3 teegmenexecution-s--ne
k6 run ird machi

# On tht.js-concurrent-1000ce/load-tes/performan/3 tests1:1egment ution-s --exechine
k6 runsecond mac

# On jscurrent.t-1000-conesce/load-ts/performantestt 0:1/3 n-segmen--executiok6 run chine
er maollcontr`bash
# On 
``machines:
 multiple g withtines
For tTestingted Load Distribusage

### dvanced Ue

## A memory usagitor cache
- Monlogicdation valihe in Review cacettings
-TL s Tk cache- Checured
 is configcheca Verify (< 30%)**
-e Hit Rate Cachw 

**Lo output in k6ror messages er
- Reviewg issuese limitinr ratfong
- Check kiorare wpoints ify all enders
- VI server logk AP*
- Chec> 1%)*rror Rate (High Elogs

** slow query iewory)
- RevU, memnts (CPonstraiource c resheck for
- Cponsivebase is resVerify data
- ceanperformerver  API s Check*
-ms)*p95 > 500mes (ponse Ti**High Reses

on Issu
### Commssed
olds pareshthAll 
✓ %it rate > 30✓ Cache h1%
 < ror ratems
✓ Er 500 <e time responsia
✓ p95iterCruccess ts

### Ssulreting Renterp50%

## ITarget:** > **
- 30%:** > Minimum- **s
 Rate Target## Cache Hit
#> 5%
* itical:*5%
- **Cring:** 1-Warn
- ** < 1%e:** **Acceptablets
-argError Rate T00ms

### 10:** < percentile)h - **p99 (99target)
✓ (Main t* < 500ms :* percentile) (95th
- **p95 < 200ms (Median):**50rgets
- **p Time Ta## Response
#argets
ormance T

## Perf```00
........: 10...............max...0
     vus_..: 100.....................vus.....
     5/s  1.48   30.......: ..........ions......
     iterat=10.1s  p(95))=8.2s   3s    p(90    max=15. med=4.8s 1s     min=2.5.2s    ..: avg=............onn_duratiio     iterat  7.6/s
: 15234  ...................._reqs.... http    490.3ms
)= p(95.1ms   p(90)=420.2ms2ms  max=850ed=169. m8.1ms  =4  minavg=229.8ms..........: .....g._waitin  http_req)=0s
    p(9590)=0s        p(   max=0s   med=0s      n=0s        mig=0s      .....: avaking...shnds_ha http_req_tl   =8.3ms
 p(95)ms    0)=6.2.1ms   p(9 max=45.1ms   d=2 mes   min=0.5m=3.2ms    .....: avgg...........in_req_send     http5.2ms
)=31ms   p(950)=25.ms  p(9x=120.3=8.1ms    mams    medms   min=1.2g=12.3......: avving........tp_req_recei
     ht 0.5%....:........ed.....tp_req_fail
     ht.1msp(95)=520450.2ms  (90)=  p3msms  max=892.ed=180.12ms   ms  min=50.g=245.3m: av...........on....req_durati
     http_5)=5.1ms p(90)=3.2ms   32.1ms   p(9x=     mad=0s   me     s min=02.1ms    ...: avg=.........onnecting.tp_req_c   htms
  =12.3 p(95)90)=8.1ms   p(s   45.2mms    max==2.31.1ms    med.2ms    min= avg=5.:........ocked.......q_bl    http_re
  900 B/s.: 1.8 MB  ...................... data_sents
    B/1.2 k3 MB   2..: .................received    data_``
 Output
`ample 
### Ex
eivedrecta sent/ Daate
-)
- Error rax, p95, p99avg, min, mmes (se tipon
- Resests/sec RequUsers)
-Us (Virtual ution:
- Vexec test rics during-time metreal6 displays trics
k Me# Real-timest

## During Teoring

## Monitjs
```urrent.-concest-1000ce/load-t/performan testsn 5mratio6 run --du`bash
k
``m Durationth Custo### Run wi```

current.js
ontest-1000-cce/load-erformans/p0m testration 1s 500 --du--vu
k6 run 
```bash Countm VUwith Custo### Run .js
```

ncurrent000-cod-test-1mance/loafor  tests/per0 \
:400//localhosthttp:ASE_URL=API_B
  -e t:5175 \lhosoca=http://lRL -e BASE_U
 \un ``bash
k6 r
`blesiaironment Varustom Envh Cwit
### Run ```
ension)
k6 extequires (rert to HTML nvn con
# The.jsojson=resultsout --.js currentcon00-ad-test-10rmance/lo tests/perfo
k6 run
```bashrtTML Repo# Run with H
##
```
s.jsonesultjson=rut --ot.js rren-concut-1000nce/load-tess/performak6 run test

```bash Output### Run with

js
```current.-con000test-1d-ormance/loaerfsts/p
k6 run te`bashic Run
``# Bas

##ts TesRunning Load
```

## ffic.jsealistic-tra-road-testformance/ls/per6 run testsh
kn:**
```ba 30%

**Ruit rate >che h, cams< 500se time on* p95 resp**Target:*)

(2 min0 users  Cool down: n)
-3 mis (in: 800 user- Mainta
ers (2 min)ike: 800 usng sp Eveni (3 min)
-rs: 300 useMaintain
-  (3 min) users00 3 decline:
- Afternoon5 min)ers (000 us 1ustained:n)
- S(2 mis user000 ke: 1h spin)
- Lunc(5 mi 500 users k:orning pea
- Mn)rs (2 mi0 useup: 10es
- Warm 1 minut** 3ion:at

**Dursistenceon perons
- Sessictime between a
- Think ti)erprise, 10% entlet 20% wallearning,owsing, 30%  30% brnew,s (10% ior behaved usery)
- Variencwer concurrs (loff-peak houry)
- Oconcurrenc (higher  hours
- Peakvior with: behalistic userates reajs`

Simulic.fftic-traest-realisd-t** `loaile:
**FTestPatterns c tic Traffi Realis### 2.```

nt.js
reur00-concd-test-10e/loarformancs/pest:4000 teur-api.com//yottp:=hBASE_URL -e API_.comour-api/y:/ttpBASE_URL=hrun -e 6 h
k`basURL:**
``stom base 

**With cu```rrent.js
cu-1000-conload-testnce/sts/performa
k6 run te``bash:**
`*Runms

*time < 500e 95 respons parget:**down

**Tamp utes r min- 2 users
ned at 1000taius10 minutes susers
- to 1000 ramp up utes 
- 5 minminutes:** 17 ation
**Durise flow
rpr- Enterning flow
en ealow
- Toke fse purchas- Couron flow
Subscripti
- kflows:istic worming realfornt users percurre000 con
Tests 1js`
ent.curr-con000t-1** `load-tes*File:ers Test
*oncurrent Us## 1. 1000 C
#ts
 Scripst## Load Teest
```

afana/k6:latll grocker pu
```bash
d**Docker:**6
```

 install kapt-getpdate
sudo  uget
sudo apt-table.listlist.d/k6-sapt/sources.etc/ee / tudon" | sable maib st.k6.io/de/dlps:/htto "deb D69
echAC1D77C6C491D63642D5715A5AD17C747E34recv-keys C.com:80 --tuubunrver.hkp://keyseer  --keyservy advapt-keudo bash
s
```/Debian):**x (Ubuntu
**Linu```
6
install kbash
choco 
```colatey):**dows (Choin
```

**Wll k6rew insta``bash
bew):**
` (Homebr

**macOSall k6### Instllation


## Insta75)
st:51tp://localhohtt: nd (defaul fronte
- Runningst:4000)/localhop:/default: httAPI server (unning - R+
20de.js on/)
- Noinstallatig-started/gettinio/docs///k6. (https:6 installednts

- kuiremeeq## Rg k6.

ora OS usintests for Az run load how toe explains 
This guidGuide
Testing # Load 