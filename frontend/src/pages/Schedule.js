import React, { useEffect, useState } from "react";
import PersonPinCircleRoundedIcon from "@mui/icons-material/PersonPinCircleRounded";
import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";
import AddModeratorRoundedIcon from "@mui/icons-material/AddModeratorRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import food_facility from "../data/food_facility";
import { format, parseISO } from "date-fns";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import { selection_attribute } from "../data/Attribute";
import Popover from "@mui/material/Popover";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { Calendar } from "react-date-range";
import hanoi from "../data/HanoiDistrict";
import "./Schedule.css";

const districts_format = hanoi.districts.map((dist) => {
  return { name: dist.name, codename: dist.codename };
});

const user = JSON.parse(localStorage.getItem("user"));

function Schedule() {
  const [selectedFacBefore, setSelectedFacBefore] = useState(undefined);
  const [selectedFacAfter, setSelectedFacAfter] = useState(undefined);
  const [specialists, setSpecialists] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [onGoing, setOnGoing] = useState([]);
  const [upComing, setUpComing] = useState([]);
  const [inspectionFac, setInspectionFac] = useState([]);
  const [request, setRequest] = useState(false);
  const [update, setUpdate] = useState(0);

  useEffect(() => {
    // Set Specialists
    fetch("/specialist/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user.role == "SPECIALIST" ? { id: user.id } : {}),
    })
      .then((res) => res.json())
      .then((data) => {
        // ?????i t??n qu???n t??? `codename` sang `name`
        data.map((spec) => {
          spec.district.map((_, i) => {
            spec.district[i] = districts_format.find((dist) =>
              dist.codename.includes(spec.district[i])
            ).name;
          });
        });

        // Set Specialists
        setSpecialists(data);

        // Set all district v???i specialist t????ng ???ng
        setDistricts(
          hanoi.districts.map((d) => {
            var belongTo = data.find((spec) => spec.district.includes(d.name));
            return {
              name: d.name,
              specialist: belongTo != undefined ? belongTo.id : 0,
              codename: d.codename,
              short_codename: d.short_codename,
            };
          })
        );

        // L???y t???t c??? danh s??ch ???? ???????c giao b??n chuy??n vi??n
        fetch("/inspection/facility", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            user.role == "SPECIALIST" ? { id: user.id } : {}
          ),
        })
          .then((res) => res.json())
          .then((data_fac) => {
            setInspectionFac(data_fac);

            // Set on_going v?? up_coming
            if (user.role == "MANAGER") {
              fetch("/inspection/plan", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ duration: 50 }),
              })
                .then((res) => res.json())
                .then((data_plan) => {
                  // ?????i t??n qu???n t??? `codename` sang `name`
                  data_plan.map((fac) => {
                    fac.address.district = districts_format.find((dist) =>
                      dist.codename.includes(fac.address.district)
                    ).name;
                  });

                  var today = new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate()
                  );
                  var tomorrow = new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate() + 1
                  );

                  var tmp_ongoing = [];
                  var tmp_upcoming = [];

                  data_plan.map((fac, i) => {
                    var inspection_date = new Date(fac.inspection_date);

                    if (
                      inspection_date >= today &&
                      inspection_date < tomorrow
                    ) {
                      tmp_ongoing.push({
                        ...fac,
                        specialist: data.find((spec) =>
                          spec.district.includes(fac.address.district)
                        ),
                      });
                    } else {
                      tmp_upcoming.push({
                        ...fac,
                        specialist: data.find((spec) =>
                          spec.district.includes(fac.address.district)
                        ),
                      });
                    }
                  });

                  setOnGoing(
                    tmp_ongoing.sort(
                      (t1, t2) => t1.inspection_date - t2.inspection_date
                    )
                  );
                  setUpComing(
                    tmp_upcoming.sort(
                      (t1, t2) => t1.inspection_date - t2.inspection_date
                    )
                  );
                });
            } else {
              fetch("/inspection/info", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  facilities: data_fac.map((f) => f.facility.id),
                }),
              })
                .then((res) => res.json())
                .then((data_info) => {
                  // ?????i t??n qu???n t??? `codename` sang `name`
                  data_info.map((fac) => {
                    fac.address.district = districts_format.find((dist) =>
                      dist.codename.includes(fac.address.district)
                    ).name;
                  });

                  var today = new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate()
                  );
                  var tomorrow = new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate() + 1
                  );

                  var tmp_ongoing = [];
                  var tmp_upcoming = [];

                  data_info.map((fac, i) => {
                    var inspection_date = new Date(fac.inspection_date);

                    if (
                      inspection_date >= today &&
                      inspection_date < tomorrow
                    ) {
                      tmp_ongoing.push({
                        ...fac,
                        specialist: data[0],
                      });
                    } else {
                      tmp_upcoming.push({
                        ...fac,
                        specialist: data[0],
                      });
                    }
                  });

                  setOnGoing(
                    tmp_ongoing.sort(
                      (t1, t2) => t1.inspection_date - t2.inspection_date
                    )
                  );
                  setUpComing(
                    tmp_upcoming.sort(
                      (t1, t2) => t1.inspection_date - t2.inspection_date
                    )
                  );
                });
            }
          });
      });
  }, [request]);

  const onUpdate = () => {
    if (update == 0) setUpdate(100);
    else setUpdate(update + 1);
  };

  const onRequest = () => {
    setRequest(!request);
  };

  const changeSelectedFac = (fac) => {
    setSelectedFacBefore(fac);
    var tmp = inspectionFac.find((f) => f.facility.id == fac._id);
    setSelectedFacAfter(tmp);
  };

  /***********************************************/
  /*    *               TOP                      */
  /*    ******************************************/
  /*  L *                              *         */
  /*  E *                              *  BOT_   */
  /*  F *           BOT_LEFT           *  RIGHT  */
  /*  T *                              *         */
  /*    *                              *         */
  /*    *                              *         */
  /*    *                              *         */
  /***********************************************/

  return (
    <div className="sched">
      {/* Left */}
      <div className="sched_left">
        <OnGoing facility={onGoing} onChange={changeSelectedFac} />
        <UpComing facility={upComing} onChange={changeSelectedFac} />
      </div>
      {/* Right */}
      <div className="sched_right">
        <div className="sched_top">
          {specialists.map((spec, index) => (
            <Specialist specialist={spec} key={index} />
          ))}
          {user.role == "MANAGER" && (
            <Assignment
              districts={districts}
              specialists={specialists}
              onRequest={onRequest}
            />
          )}
        </div>
        {selectedFacBefore && (
          <div className="sched_bot">
            <div className="sched_bot_left">
              <FacilityBefore facility={selectedFacBefore} />
              <FacilityAfter
                facility={selectedFacAfter}
                onRequest={onRequest}
                update={update}
              />
            </div>
            <div className="sched_bot_right">
              <Info facility={selectedFacBefore} />
              <CommandButton
                before={selectedFacBefore}
                after={selectedFacAfter}
                onRequest={onRequest}
                onUpdate={onUpdate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Specialist = ({ specialist }) => {
  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <div>
      <Button className="sched_spec_btn" onClick={handleOpenModal}>
        {specialist.id}. {specialist.name}
      </Button>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <div className="sched_spec_dist">
            <h2>{specialist.name}</h2>
            {specialist.district.map((dist, index) => (
              <span key={index}>{dist}</span>
            ))}
          </div>
        </Fade>
      </Modal>
    </div>
  );
};

const Assignment = ({ districts: init_dist, specialists, onRequest }) => {
  const [openModal, setOpenModal] = useState(false);
  const [districts, setDistricts] = useState(init_dist);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  useEffect(() => {
    setDistricts(init_dist);
  }, [init_dist]);

  const changeSpecialist = (index, spec_id) => {
    var tmp = JSON.parse(JSON.stringify(districts));
    if (tmp[index].specialist == spec_id) {
      tmp[index].specialist = 0;
    } else {
      tmp[index].specialist = spec_id;
    }
    setDistricts(tmp);
  };

  const handleSave = () => {
    fetch("/account/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        specialists.map((spec) => {
          var tmp = districts.filter((dist) => dist.specialist == spec.id);
          return {
            id: spec._id,
            district: tmp.map((t) => t.short_codename),
          };
        })
      ),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        handleCloseModal();
        // window.location.reload();
        onRequest();
      });
  };

  return (
    <div>
      <Button className="sched_asgmt_btn" onClick={handleOpenModal}>
        <CallSplitRoundedIcon />
        Ph??n c??ng
      </Button>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openModal}>
          <div className="sched_spec_dist">
            <h2>Ph??n c??ng</h2>
            {districts.map((dist, index) => (
              <span key={index}>
                {dist.name}
                {specialists.map((spec, idx) => (
                  <p
                    key={idx}
                    className={`sched_spec_el ${
                      dist.specialist == spec.id && "sched_spec_el--active"
                    }`}
                    onClick={() => changeSpecialist(index, spec.id)}
                  >
                    {spec.id}
                  </p>
                ))}
              </span>
            ))}
            <Button
              className="sched_asgmt_btn sched_asgmt_btn_save"
              onClick={handleSave}
            >
              <SaveRoundedIcon />
              L??u
            </Button>
          </div>
        </Fade>
      </Modal>
    </div>
  );
};

const OnGoing = ({ facility, onChange }) => {
  return (
    <div className="sched_ongoing">
      <div className="sched_ongoing_header">
        <h2>??ang ti???n h??nh</h2>
      </div>
      {facility.map((fac, index) => (
        <div
          className="sched_ongoing_body"
          key={index}
          onClick={() => onChange(fac)}
        >
          <p className="sched_ongoing_name">{fac.fullname}</p>
          <p className="sched_ongoing_number">
            <strong>S???&nbsp;</strong>
            {fac.certification_number}
          </p>
          <div className="sched_ongoing_spec">
            <PersonPinCircleRoundedIcon />
            {fac.specialist?.name}
          </div>
        </div>
      ))}
    </div>
  );
};

const UpComing = ({ facility, onChange }) => {
  return (
    <div className="sched_ongoing">
      <div className="sched_ongoing_header">
        <h2>S???p t???i</h2>
      </div>
      {facility.map((fac, index) => (
        <div
          className="sched_ongoing_body"
          key={index}
          onClick={() => onChange(fac)}
        >
          <p className="sched_ongoing_name">{fac.fullname}</p>
          <tr className="sched_ongoing_number">
            <td>
              <strong>S???&nbsp;</strong>
            </td>
            <td>{fac.certification_number}</td>
          </tr>
          <tr className="sched_ongoing_number">
            <td>
              <strong>Ng??y&nbsp;</strong>
            </td>
            <td>
              {fac.inspection_date &&
                format(parseISO(fac.inspection_date), "dd/MM/yyyy")}
            </td>
          </tr>
          <div className="sched_ongoing_spec">
            <PersonPinCircleRoundedIcon />
            {fac.specialist?.name}
          </div>
        </div>
      ))}
    </div>
  );
};

const FacilityBefore = ({ facility }) => {
  const [detailCriteria, setDetailCriteria] = useState(false);
  const openDetailCriteria = () => {
    setDetailCriteria(true);
  };
  const closeDetailCriteria = () => setDetailCriteria(false);

  return (
    facility && (
      <div className="sched_fac">
        <h2>Tr???ng th??i hi???n t???i</h2>
        <div>
          <tr>
            <td>T??n c?? s???</td>
            <td>{facility.fullname}</td>
          </tr>
          <tr>
            <td>?????a ch???</td>
            <td>
              {facility.address.street +
                ", " +
                facility.address.town +
                ", " +
                facility.address.district +
                ", " +
                facility.address.city}
            </td>
          </tr>
          <tr>
            <td>S??? ??i???n tho???i</td>
            <td>{facility.phone_number}</td>
          </tr>
          <tr>
            <td>S??? c???p gi???y ch???ng nh???n</td>
            <td>{facility.certification_number}</td>
          </tr>
          <tr>
            <td>Lo???i h??nh kinh doanh</td>
            <td>
              <div className="sched_fac_status">
                {facility.business_type.map((value, idx) => (
                  <span
                    key={idx}
                    className={
                      value[0] == "S" || value[0] == "s"
                        ? "home__business__type1"
                        : "home__business__type2"
                    }
                  >
                    {value}
                  </span>
                ))}
              </div>
            </td>
          </tr>
          <tr>
            <td>Ng??y c???p</td>
            <td>
              {format(parseISO(facility.certification.MFG), "dd/MM/yyyy")}
            </td>
          </tr>
          <tr>
            <td>Ng??y h???t h???n / Ng??y thu h???i</td>
            <td>
              {format(
                parseISO(facility.certification.expiration_date),
                "dd/MM/yyyy"
              )}
            </td>
          </tr>
          <tr>
            <td>Ti??u ch??</td>
            <td onClick={openDetailCriteria}>
              <span>
                {
                  selection_attribute
                    .map((attr) => facility[attr.code])
                    .filter((criteria) => criteria).length
                }
                <CheckRoundedIcon className="ensure" />
              </span>
              <span>
                {
                  selection_attribute
                    .map((attr) => facility[attr.code])
                    .filter((criteria) => !criteria).length
                }
                <ClearRoundedIcon className="not_ensure" />
              </span>
            </td>
            <DetailCriteria
              facility={facility}
              open={detailCriteria}
              handleClose={closeDetailCriteria}
            />
          </tr>
        </div>
      </div>
    )
  );
};

const DetailCriteria = ({ facility, open, handleClose }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <div className="home_detail_criteria">
          <h2>Chi ti???t</h2>
          <div className="sched_fac_table">
            <tr>
              <td>T??n c?? s???</td>
              <td>{facility.fullname}</td>
            </tr>
            <tr>
              <td>S??? c???p Gi???y ch???ng nh???n</td>
              <td>{facility.certification_number}</td>
            </tr>
            {selection_attribute.map((attr, index) => (
              <tr key={index}>
                <td>{attr.title}</td>
                <td>
                  {facility[attr.code] ? (
                    <>
                      ?????m b???o
                      <CheckRoundedIcon className="ensure" />
                    </>
                  ) : (
                    <>
                      Kh??ng ?????m b???o
                      <ClearRoundedIcon className="not_ensure" />
                    </>
                  )}
                </td>
              </tr>
            ))}
          </div>
        </div>
      </Fade>
    </Modal>
  );
};

const FacilityAfter = ({ facility: fac, onRequest, update }) => {
  const [criteria, setCriteria] = useState(
    fac && {
      environment: fac.facility.environment,
      appliances: fac.facility.appliances,
      waterSource: fac.facility.water_source,
      ingredients: fac.facility.ingredients,
      foodPreservation: fac.facility.food_preservation,
      wasteTreatment: fac.facility.waste_treatment,
      owners: fac.facility.owners,
      processing: fac.facility.processing,
    }
  );
  const [businessType, setBusinessType] = useState(
    fac && fac.facility.business_type
  );

  const [foodSample, setFoodSample] = useState(fac && fac.food_sample);
  const [currSample, setCurrSample] = useState();
  const [detailSample, setDetailSample] = useState(false);
  const [decision, setDecision] = useState(
    (fac && fac.facility.decision) || []
  );

  useEffect(() => {
    setCriteria(
      fac && {
        environment: fac.facility.environment,
        appliances: fac.facility.appliances,
        waterSource: fac.facility.water_source,
        ingredients: fac.facility.ingredients,
        foodPreservation: fac.facility.food_preservation,
        wasteTreatment: fac.facility.waste_treatment,
        owners: fac.facility.owners,
        processing: fac.facility.processing,
      }
    );
    setBusinessType(fac && fac.facility.business_type);

    setFoodSample(fac && fac.food_sample);
    setCurrSample();
    setDetailSample(false);

    setDecision((fac && fac.facility.decision) || []);
  }, [fac]);

  useEffect(() => {
    if (user.role == "SPECIALIST" && update > 0) {
      fetch("/inspection/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...fac,
          facility: {
            ...fac.facility,
            environment: criteria.environment,
            appliances: criteria.appliances,
            water_source: criteria.waterSource,
            ingredients: criteria.ingredients,
            food_preservation: criteria.foodPreservation,
            waste_treatment: criteria.wasteTreatment,
            owners: criteria.owners,
            processing: criteria.processing,
            business_type: businessType,
          },
          food_sample: foodSample,
          decision: decision,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          onRequest();
        });
    }
  }, [update]);

  const openDetailSample = (sample, i) => {
    setCurrSample((currSample) => {
      return { ...sample, idx: i };
    });
    setDetailSample(true);
  };

  const closeDetailSample = () => setDetailSample(false);

  const changeCriteria = (e, criterion) => {
    var value = e.target.value;
    var tmp = JSON.parse(JSON.stringify(criteria));
    tmp[criterion] = value;
    setCriteria(tmp);
  };
  const changeBusinessType = (e, type) => {
    var value = e.target.checked;
    var tmp = JSON.parse(JSON.stringify(businessType));
    if (value) {
      tmp.push(type);
    } else {
      tmp = tmp.length > 1 ? tmp.filter((item) => item !== type) : tmp;
    }
    setBusinessType(tmp);
  };

  const handleSample = (s) => {
    var tmp = JSON.parse(JSON.stringify(foodSample));

    if (s.idx == "-1") {
      tmp.push(s);
    } else {
      tmp[s.idx] = s;
    }
    setFoodSample(tmp);
  };
  const onChangeDecision = (e, type) => {
    var value = e.target.checked;
    var tmp = JSON.parse(JSON.stringify(decision));
    if (value) {
      if (type == "dat chuan") {
        tmp = ["dat chuan"];
      } else {
        if (tmp.includes("dat chuan")) {
          tmp = tmp.filter((t) => t != "dat chuan");
        }
        tmp.push(type);
      }
    } else {
      tmp = tmp.length > 1 ? tmp.filter((item) => item !== type) : tmp;
    }
    setDecision(tmp);
  };

  return (
    fac && (
      <div className="sched_fac">
        <h2>??ang ti???n h??nh</h2>
        <div className="sched_fac_table">
          <tr>
            <td>T??n c?? s???</td>
            <td>{fac.facility.fullname}</td>
          </tr>
          <tr>
            <td>S??? c???p gi???y ch???ng nh???n</td>
            <td>{fac.facility.certification_number}</td>
          </tr>
        </div>
        <div className="modal__business__type">
          <h2>Lo???i h??nh kinh doanh</h2>
          <FormControlLabel
            name="businessType"
            control={
              <Checkbox
                size="small"
                color="secondary"
                checked={businessType.includes("s???n xu???t th???c ph???m")}
                onChange={(e) => changeBusinessType(e, "s???n xu???t th???c ph???m")}
              />
            }
            label="S???n xu???t th???c ph???m"
          />
          <FormControlLabel
            name="businessType"
            control={
              <Checkbox
                size="small"
                color="secondary"
                checked={businessType.includes("d???ch v??? ??n u???ng")}
                onChange={(e) => changeBusinessType(e, "d???ch v??? ??n u???ng")}
              />
            }
            label="D???ch v??? ??n u???ng"
          />
        </div>
        <div className="modal__table__attr">
          <table>
            <thead className={"modal__table__header"}>
              <tr>
                <th>C??c ti??u ch??</th>
                <th>?????m b???o</th>
                <th>Kh??ng ?????m b???o</th>
              </tr>
            </thead>
            <tbody className="modal__table__body">
              {selection_attribute.map((attr, index) => (
                <tr key={index}>
                  <td>{attr.title}</td>
                  <td>
                    <FormControlLabel
                      name={attr.filter}
                      control={
                        <Radio
                          checked={criteria[attr.filter] == 1}
                          value={1}
                          onChange={(e) => changeCriteria(e, attr.filter)}
                          size="small"
                        />
                      }
                      label={<CheckRoundedIcon />}
                      classes={{ label: "modal__attr__ensure" }}
                    />
                  </td>
                  <td>
                    <FormControlLabel
                      name={attr.filter}
                      control={
                        <Radio
                          checked={criteria[attr.filter] == 0}
                          value={0}
                          onChange={(e) => changeCriteria(e, attr.filter)}
                          size="small"
                        />
                      }
                      label={<ClearRoundedIcon />}
                      classes={{ label: "modal__attr__not-ensure" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sched_fac_after_sample">
          <span>M???u th???c ph???m</span>
          <Button
            className="sched_fac_after_add"
            onClick={() => openDetailSample({}, -1)}
          >
            <AddModeratorRoundedIcon />
            Th??m
          </Button>
          {foodSample.map((item, i) => (
            <tr key={i} onClick={() => openDetailSample(item, i)}>
              <td>{i + 1}.</td>
              <td>
                <FoodSample sample={item} />
              </td>
            </tr>
          ))}
        </div>
        <div className="modal__business__type">
          <h2>Quy???t ?????nh</h2>
          <FormControlLabel
            name="decision"
            control={
              <Checkbox
                size="small"
                color="secondary"
                checked={decision.includes("dat chuan")}
                onChange={(e) => onChangeDecision(e, "dat chuan")}
              />
            }
            label="?????t chu???n"
          />
          <FormControlLabel
            name="decision"
            control={
              <Checkbox
                size="small"
                color="secondary"
                checked={decision.includes("thu hoi")}
                onChange={(e) => onChangeDecision(e, "thu hoi")}
              />
            }
            label="Thu h???i"
          />
          <FormControlLabel
            name="decision"
            control={
              <Checkbox
                size="small"
                color="secondary"
                checked={decision.includes("xu phat")}
                onChange={(e) => onChangeDecision(e, "xu phat")}
              />
            }
            label="X??? ph???t"
          />
        </div>
        <DetailSample
          sample={currSample}
          open={detailSample}
          handleClose={closeDetailSample}
          handleSample={handleSample}
        />
      </div>
    )
  );
};

const FoodSample = ({ sample }) => {
  return (
    sample && (
      <div className="sched_sample">
        <tr>
          <td>M?? m???u</td>
          <td>{sample.id}</td>
        </tr>
        <tr>
          <td>T??n m???u</td>
          <td>{sample.name}</td>
        </tr>
        <tr>
          <td>Ng??y gi??m ?????nh</td>
          <td>{format(parseISO(sample.start_date), "dd/MM/yyyy")}</td>
        </tr>
        <tr>
          <td>Ng??y nh???n k???t qu???</td>
          <td>{format(parseISO(sample.end_date), "dd/MM/yyyy")}</td>
        </tr>
        <tr>
          <td>K???t qu???</td>
          <td>{sample.result}</td>
        </tr>
      </div>
    )
  );
};

const DetailSample = ({ sample, open, handleClose, handleSample }) => {
  // Popover
  const [anchor, setAnchor] = useState(null);
  const [type, setType] = useState("start");
  // Date range
  const [id, setId] = useState((sample && sample.id) || "");
  const [name, setName] = useState((sample && sample.name) || "");
  const [unit, setUnit] = useState((sample && sample.unit) || "");
  const [startDate, setStartDate] = useState(
    (sample && sample.start_date && parseISO(sample.start_date)) || new Date()
  );
  const [endDate, setEndDate] = useState(
    (sample && sample.end_date && parseISO(sample.end_date)) || new Date()
  );
  const [result, setResult] = useState((sample && sample.result) || undefined);

  const openPopover = (event, _type) => {
    setType(_type);
    setAnchor(event.currentTarget);
  };
  const closePopover = () => {
    setAnchor(null);
  };
  const onChange = (date) => {
    if (type == "start") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  };
  const onChangeId = (e) => {
    setId(e.target.value);
  };
  const onChangeName = (e) => {
    setName(e.target.value);
  };
  const onChangeUnit = (e) => {
    setUnit(e.target.value);
  };
  const onHandleSample = () => {
    handleSample({
      ...sample,
      id: id,
      name: name,
      unit: unit,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      result: result,
    });
    handleClose();
  };
  const onChangeResult = (e) => {
    var value = e.target.value == "true";
    setResult(value);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <div className="home_detail_criteria">
          <h2>M???u th???c ph???m</h2>
          {sample && (
            <div className="sched_fac_table">
              <tr>
                <td>M?? m???u</td>
                <td>
                  <input
                    type="text"
                    className="sched_fac_input"
                    value={id}
                    onChange={onChangeId}
                  />
                </td>
              </tr>
              <tr>
                <td>T??n m???u</td>
                <td>
                  <input
                    type="text"
                    className="sched_fac_input"
                    value={name}
                    onChange={onChangeName}
                  />
                </td>
              </tr>
              <tr>
                <td>?????n v??? gi??m ?????nh</td>
                <td>
                  <input
                    type="text"
                    className="sched_fac_input"
                    value={unit}
                    onChange={onChangeUnit}
                  />
                </td>
              </tr>
              <tr>
                <td>Ng??y gi??m ?????nh</td>
                <td
                  onClick={(event) => openPopover(event, "start")}
                  style={{ cursor: "pointer" }}
                >
                  {format(startDate, "dd/MM/yyyy")}
                </td>
              </tr>
              <tr>
                <td>Ng??y nh???n k???t qu???</td>
                <td
                  onClick={(event) => openPopover(event, "end")}
                  style={{ cursor: "pointer" }}
                >
                  {format(endDate, "dd/MM/yyyy")}
                </td>
              </tr>
              <tr>
                <td>K???t qu???</td>
                <td>
                  <FormControlLabel
                    name={"sample"}
                    control={
                      <Radio
                        checked={result == true}
                        value={"true"}
                        onChange={(e) => onChangeResult(e)}
                        size="small"
                      />
                    }
                    label={<CheckRoundedIcon />}
                    classes={{ label: "sample_ensure" }}
                  />
                  <FormControlLabel
                    name={"sample"}
                    control={
                      <Radio
                        checked={result == false}
                        value={"false"}
                        onChange={(e) => onChangeResult(e)}
                        size="small"
                      />
                    }
                    label={<ClearRoundedIcon />}
                    classes={{ label: "sample_not_ensure" }}
                  />
                </td>
              </tr>
            </div>
          )}
          <Popover
            open={Boolean(anchor)}
            onClose={closePopover}
            anchorEl={anchor}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Calendar
              date={type == "start" ? startDate : endDate}
              onChange={onChange}
            />
          </Popover>
          <Button className="sched_fac_after_add" onClick={onHandleSample}>
            <CheckCircleRoundedIcon />
            Xong
          </Button>
        </div>
      </Fade>
    </Modal>
  );
};

const Info = ({ facility }) => {
  return (
    <div className="sched_fac">
      <tr>
        <td>Tr???ng th??i</td>
        <td>
          <div className="sched_fac_status">
            {Date.now() >= parseISO(facility.inspection_date) ? (
              <span className={"home__business__type1"}>??ang ti???n h??nh</span>
            ) : (
              <span className={"home__business__type2"}>S???p t???i</span>
            )}
          </div>
        </td>
      </tr>
      <tr>
        <td>Ng??y b???t ?????u</td>
        <td>{format(parseISO(facility.inspection_date), "dd/MM/yyyy")}</td>
      </tr>
      <tr>
        <td>Ph??? tr??ch</td>
        <td>{facility.specialist.name}</td>
      </tr>
    </div>
  );
};

const CommandButton = ({ before, after, onRequest, onUpdate }) => {
  const assign = () => {
    fetch("/inspection/insert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start_date: before.inspection_date,
        food_sample: [],
        decision: [],
        confirm: false,
        facility: {
          id: before._id,
          fullname: before.fullname,
          certification_number: before.certification_number,
          business_type: before.business_type,
        },
        specialist: before.specialist._id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        onRequest();
      });
  };

  const complete = () => {};

  const confirm = () => {
    fetch("/inspection/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...after,
        confirm: true,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        onRequest();
        after["confirm"] = true;
      });
  };

  return (
    <div className="sched_cmd_btn">
      {user.role == "MANAGER" && !after && (
        <Button className="sched_asgmt_btn" onClick={assign}>
          <SendRoundedIcon />
          Giao vi???c
        </Button>
      )}
      {user.role == "MANAGER" && after && (
        <Button
          className="sched_asgmt_btn"
          onClick={complete}
          disabled={after.decision.length == 0}
        >
          <CheckCircleRoundedIcon />
          Ho??n th??nh
        </Button>
      )}

      {user.role == "SPECIALIST" && !after.confirm && (
        <Button className="sched_asgmt_btn" onClick={confirm}>
          <ThumbUpAltRoundedIcon />
          X??c nh???n
        </Button>
      )}

      {user.role == "SPECIALIST" && after.confirm && (
        <Button className="sched_asgmt_btn" onClick={onUpdate}>
          <AutorenewRoundedIcon />
          C???p nh???t
        </Button>
      )}

      {user.role == "SPECIALIST" && after.confirm && (
        <Button
          className="sched_asgmt_btn"
          onClick={complete}
          disabled={after.decision.length == 0}
        >
          <CheckCircleRoundedIcon />
          Ho??n th??nh
        </Button>
      )}
    </div>
  );
};

export default Schedule;
