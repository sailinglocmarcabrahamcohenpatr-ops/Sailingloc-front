<?php

namespace App\Controller;

use App\Entity\Reservation;
use App\Repository\BateauRepository;
use App\Repository\ReservationRepository;
use App\Service\EmailService;
use App\Service\StripeService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/reservation')]
class ReservationController extends AbstractController
{
    #[Route('/nouvelle/{bateauId}', name: 'reservation_nouvelle', methods: ['GET', 'POST'])]
    public function nouvelle(
        int $bateauId,
        Request $request,
        BateauRepository $bateauRepository,
        ReservationRepository $reservationRepository,
        EntityManagerInterface $em,
        StripeService $stripeService,
        Security $security,
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $bateau = $bateauRepository->find($bateauId);
        if (!$bateau || !$bateau->isDisponible()) {
            throw $this->createNotFoundException('Bateau introuvable ou indisponible.');
        }

        if ($request->isMethod('POST')) {
            $dateDebutStr  = $request->request->get('date_debut');
            $dateFinStr    = $request->request->get('date_fin');
            $nbPersonnes   = (int) $request->request->get('nombre_personnes', 1);

            $dateDebut = \DateTimeImmutable::createFromFormat('Y-m-d', $dateDebutStr);
            $dateFin   = \DateTimeImmutable::createFromFormat('Y-m-d', $dateFinStr);

            if (!$dateDebut || !$dateFin || $dateFin <= $dateDebut) {
                $this->addFlash('error', 'Les dates sélectionnées sont invalides.');
                return $this->redirectToRoute('reservation_nouvelle', ['bateauId' => $bateauId]);
            }

            if (!$reservationRepository->isBateauDisponible($bateauId, $dateDebut, $dateFin)) {
                $this->addFlash('error', 'Le bateau n\'est pas disponible pour ces dates.');
                return $this->redirectToRoute('reservation_nouvelle', ['bateauId' => $bateauId]);
            }

            $reservation = new Reservation();
            $reservation->setBateau($bateau);
            $reservation->setLocataire($security->getUser());
            $reservation->setDateDebut($dateDebut);
            $reservation->setDateFin($dateFin);
            $reservation->setNombrePersonnes($nbPersonnes);
            $reservation->calculerMontant();

            $em->persist($reservation);
            $em->flush();

            // Redirection vers le paiement Stripe
            return $this->redirectToRoute('paiement_checkout', ['reservationId' => $reservation->getId()]);
        }

        return $this->render('reservation/nouvelle.html.twig', [
            'bateau' => $bateau,
        ]);
    }

    #[Route('/mes-reservations', name: 'reservation_liste', methods: ['GET'])]
    public function liste(Security $security): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        return $this->render('reservation/liste.html.twig', [
            'reservations' => $security->getUser()->getReservations(),
        ]);
    }

    #[Route('/{id}', name: 'reservation_detail', methods: ['GET'])]
    public function detail(Reservation $reservation, Security $security): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        if ($reservation->getLocataire() !== $security->getUser()) {
            throw $this->createAccessDeniedException();
        }

        return $this->render('reservation/detail.html.twig', [
            'reservation' => $reservation,
        ]);
    }

    #[Route('/{id}/annuler', name: 'reservation_annuler', methods: ['POST'])]
    public function annuler(
        Reservation $reservation,
        Security $security,
        EntityManagerInterface $em,
        EmailService $emailService,
    ): Response {
        $this->denyAccessUnlessGranted('ROLE_USER');

        if ($reservation->getLocataire() !== $security->getUser()) {
            throw $this->createAccessDeniedException();
        }

        if ($reservation->getStatut() === Reservation::STATUT_EN_ATTENTE) {
            $reservation->setStatut(Reservation::STATUT_ANNULEE);
            $em->flush();
            $emailService->envoyerNotificationAnnulation($reservation, $security->getUser());
            $this->addFlash('success', 'Votre réservation a bien été annulée.');
        }

        return $this->redirectToRoute('reservation_liste');
    }
}
