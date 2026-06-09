<?php

namespace App\Controller;

use App\Entity\Paiement;
use App\Entity\Reservation;
use App\Repository\PaiementRepository;
use App\Repository\ReservationRepository;
use App\Service\EmailService;
use App\Service\StripeService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/paiement')]
class PaiementController extends AbstractController
{
    /**
     * Crée une session Stripe Checkout et redirige vers la page de paiement.
     */
    #[Route('/checkout/{reservationId}', name: 'paiement_checkout', methods: ['GET'])]
    public function checkout(
        int $reservationId,
        ReservationRepository $reservationRepository,
        EntityManagerInterface $em,
        StripeService $stripeService,
        Security $security,
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $reservation = $reservationRepository->find($reservationId);
        if (!$reservation || $reservation->getLocataire() !== $security->getUser()) {
            throw $this->createNotFoundException();
        }

        if ($reservation->getStatut() !== Reservation::STATUT_EN_ATTENTE) {
            return $this->redirectToRoute('reservation_detail', ['id' => $reservationId]);
        }

        $session = $stripeService->creerSessionCheckout($reservation);

        // Persiste la session Stripe liée à la réservation
        $paiement = new Paiement();
        $paiement->setMontantCentimes($reservation->getMontantTotalCentimes());
        $paiement->setStripeSessionId($session->id);
        $reservation->setPaiement($paiement);

        $em->persist($paiement);
        $em->flush();

        return $this->redirect($session->url);
    }

    /**
     * Page de retour après un paiement réussi (callback Stripe).
     */
    #[Route('/success/{reservationId}', name: 'paiement_success', methods: ['GET'])]
    public function success(
        int $reservationId,
        Request $request,
        ReservationRepository $reservationRepository,
        PaiementRepository $paiementRepository,
        EntityManagerInterface $em,
        StripeService $stripeService,
        EmailService $emailService,
    ): Response {
        $reservation = $reservationRepository->find($reservationId);
        if (!$reservation) {
            throw $this->createNotFoundException();
        }

        $sessionId = $request->query->get('session_id');
        if ($sessionId) {
            $session = $stripeService->recupererSession($sessionId);

            if ($session->payment_status === 'paid') {
                $paiement = $reservation->getPaiement();
                if ($paiement && $paiement->getStatut() !== Paiement::STATUT_REUSSI) {
                    $paiement->marquerCommeReussi();
                    $paiement->setStripePaymentIntentId($session->payment_intent);
                    $reservation->setStatut(Reservation::STATUT_CONFIRMEE);
                    $em->flush();

                    // Envoi des emails de confirmation
                    $emailService->envoyerConfirmationReservation($reservation);
                    $emailService->envoyerRecapitulatifPaiement($reservation);
                    $emailService->notifierProprietaire($reservation);
                }
            }
        }

        return $this->render('paiement/success.html.twig', [
            'reservation' => $reservation,
        ]);
    }

    /**
     * Page de retour après une annulation du paiement par le client.
     */
    #[Route('/cancel/{reservationId}', name: 'paiement_cancel', methods: ['GET'])]
    public function cancel(
        int $reservationId,
        ReservationRepository $reservationRepository,
    ): Response {
        $reservation = $reservationRepository->find($reservationId);
        if (!$reservation) {
            throw $this->createNotFoundException();
        }

        return $this->render('paiement/cancel.html.twig', [
            'reservation' => $reservation,
        ]);
    }

    /**
     * Webhook Stripe — point d'entrée pour les événements asynchrones.
     * Cette route doit être exclue du CSRF et de l'authentification.
     */
    #[Route('/webhook', name: 'paiement_webhook', methods: ['POST'])]
    public function webhook(
        Request $request,
        StripeService $stripeService,
        PaiementRepository $paiementRepository,
        EntityManagerInterface $em,
        EmailService $emailService,
        LoggerInterface $logger,
    ): JsonResponse {
        $payload  = $request->getContent();
        $sigHeader = $request->headers->get('Stripe-Signature', '');

        try {
            $event = $stripeService->construireEvenementWebhook($payload, $sigHeader);
        } catch (\Exception $e) {
            $logger->error('Webhook Stripe invalide : ' . $e->getMessage());
            return new JsonResponse(['error' => 'Webhook invalide'], Response::HTTP_BAD_REQUEST);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $paiement = $paiementRepository->findByStripePaymentIntentId($paymentIntent->id);
                if ($paiement && $paiement->getStatut() !== Paiement::STATUT_REUSSI) {
                    $paiement->marquerCommeReussi();
                    $reservation = $paiement->getReservation();
                    $reservation->setStatut(Reservation::STATUT_CONFIRMEE);
                    $em->flush();

                    $emailService->envoyerConfirmationReservation($reservation);
                    $emailService->envoyerRecapitulatifPaiement($reservation);
                    $emailService->notifierProprietaire($reservation);
                }
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                $paiement = $paiementRepository->findByStripePaymentIntentId($paymentIntent->id);
                if ($paiement) {
                    $paiement->setStatut(Paiement::STATUT_ECHOUE);
                    $em->flush();
                }
                break;

            case 'charge.refunded':
                $charge = $event->data->object;
                $paiement = $paiementRepository->findByStripePaymentIntentId($charge->payment_intent);
                if ($paiement) {
                    $paiement->setStatut(Paiement::STATUT_REMBOURSE);
                    $paiement->getReservation()->setStatut(Reservation::STATUT_ANNULEE);
                    $em->flush();
                }
                break;
        }

        return new JsonResponse(['status' => 'ok']);
    }
}
