const request = require('supertest');
const app = require("../app")
const db = require('../db');


describe('URL Shortener ', () => {
    beforeEach(async () => {
      await db.connect();
    
    }, 10000); 
  
    afterAll(async () => {

        const deleteUser = await db.db.users.destroy({
            where: {
                email: "aswolomon@gmail.com"
            }
        })

        const deleteCustomURL = await db.db.URLs.findOne({where: 
        { 
            shortURL: "http://localhost:8099/servable"
        }})
      await db.sequelize.close();


    });
  
    it('POST /input-email Route Positive Test', async () => {
      const res = 
      await request(app.app)
        .post('/input-email')
        .send({
          email: 'gloriasolomdccon998@gmail.com'
        })
        expect(res.statusCode).toBe(200);
        expect(res.body.redirect).toBe( "/signup");
     
    });
    it('POST /input-email Route Negative Test', async () => {
        const res = 
        await request(app.app)
          .post('/input-email')
          .send({
            email: 'rwandagloria@gmail.com'
          })
          expect(res.statusCode).toBe(200);     
      });

      it("GET /:shortUrl Route", async () => {

        const res = await request(app.app).get("/p1c");
        const base = "http://localhost:8099/"
        const checkURLInDatabase = await db.db.URLs.findOne({where: {
            shortURL: base + "p1c"
          }});
        
        expect (res.statusCode).toBe(302);
        expect(res.headers.location).toBe(checkURLInDatabase.dataValues.longURL)

      })

      it("POST /generate-url Route",  async () => {

        const res = await request(app.app).post("/user/generate-url").send({
            url: "https://smallbusiness.withgoogle.com/intl/en-ssa/?subid=ng_en-et-g-awa-a-g_hpbfoot1_1!o2&utm_source=google&utm_medium=ep&utm_campaign=google_hpbfooter&utm_content=google_hpbfooter&gmbsrc=ng-en_GB-et-gs-z-gmb-s-z-u~sb-g4sb_srvcs-u#!/"
        })
        expect(res.body.shortURL.length).toBeLessThan(200);
        expect(res.body.shortURL).toBeDefined();
        

      })

      it("POST /user/custom-url", async () => {

        const res = await request(app.app).post("/user/custom-url").send({

            longURL: "https://observablehq.com/@d3/gallery?utm_source=d3js-org&utm_medium=hero&utm_campaign=try-observable",
            shortURL: "blueshort"
        });

        expect(res.statusCode).toBe(201);
      })

      it("POST /Signup Route", async () => 
      {
        const res = await request(app.app).post("/input-email")
        .send({
            email: "polarization@gmail.com"
        }).then(() => {

            return request(app.app).post("/signup").send(
                {
                    password: "gloriasolomon"
                }
            )
        })
        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe("Account Created Successfully!");

      })
    
  })
  