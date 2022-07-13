import { Button, Paper, Rating } from "@mui/material";
import { useEffect, useState } from "react";
import { Api } from "../../services/api";
import MiniCardImg from "../miniCardImg";
import { CardPaper, ContainerButtons, ContainerInfoCard } from "./styles";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import ModalBooking from "../modalBooking";
import ModalReviewAccommodation from "../ModalReviewAccommodation";

function CardDashBoard({ element, conditional, userBookings, setRenderAgain }) {
  const [reviews, setReviews] = useState();
  const [reviewAverage, setReviewAverage] = useState(5);
  const [modal, setModal] = useState(false);
  const [reviewAccommodation, setReviewAccommodation] = useState(false);

  const history = useHistory();

  useEffect(() => {
    Api.get("/accommodationReview")
      .then((response) => setReviews(response.data))
      .catch((err) => console.log(err));
  }, []);

  function readMore() {
    history.push(`/accommodation/${element.id}`);
  }

  function cancelTrip() {
    const id = localStorage.getItem("userId");
    const token = localStorage.getItem("userToken");

    Api.patch(
      `/bookings/${userBookings.id}`,
      {
        userId: id,
        status: "cancelled",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(
        (response) => response.data,
        toast.success("Your trip has been cancelled!"),
        setRenderAgain(true)
      )
      .catch((err) => toast.error("Something went bad, try again!"));
  }

  function bookingModal() {
    setModal(true);
  }

  function openReviewModal() {
    setReviewAccommodation(!reviewAccommodation);
  }

  useEffect(() => {
    let temporaryArray = 0;
    let counter = 0;
    if (element && reviews) {
      for (let i = 0; i < reviews.length; i++) {
        if (reviews[i].idAccommodation === element.id) {
          temporaryArray += reviews[i].review;
          counter++;
        }
      }
    }
    let average = temporaryArray / counter;
    setReviewAverage(average);
  }, [reviews, element]);
  return (
    <>
      <CardPaper opacity={conditional} elevation={3}>
        <div className="imgContainer">
          <img src={element?.imageUrl[0]} alt="" />
          <MiniCardImg imgMobile />
        </div>
        <ContainerInfoCard>
          <h1>{element?.name}</h1>
          <Paper
            elevation={2}
            sx={{
              width: "9rem",
              textAlign: "center",
              alignItems: "center",
              borderRadius: "0.5rem",
            }}
          >
            <Rating name="half-rating" value={reviewAverage} precision={0.5} />
          </Paper>
          <p>{element?.description}</p>
          <MiniCardImg element={element} />
        </ContainerInfoCard>
        <ContainerButtons>
          {conditional === "cancelled" ? (
            <Button variant="contained" onClick={bookingModal}>
              Book Again
            </Button>
          ) : conditional === "finished" ? (
            <Button variant="contained" onClick={openReviewModal}>
              Add Review
            </Button>
          ) : (
            <Button variant="contained" onClick={cancelTrip}>
              Cancel Trip
            </Button>
          )}

          <Button variant="outlined" onClick={readMore}>
            Read More
          </Button>
        </ContainerButtons>
      </CardPaper>
      {modal && <ModalBooking setModal={setModal} price={element.price} />}
      {reviewAccommodation && (
        <ModalReviewAccommodation
          reviews={reviews && reviews[0].idAccommodation}
          setReviewAccommodation={setReviewAccommodation}
          element={element.id}
        />
      )}
    </>
  );
}

export default CardDashBoard;
